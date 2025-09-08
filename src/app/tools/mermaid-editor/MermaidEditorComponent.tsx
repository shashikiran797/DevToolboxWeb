'use client';

import React, { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import useDebounce from '@/app/hooks/useDebounce';
import TextArea from '@/app/components/common/TextArea';

// Initialize Mermaid once
mermaid.initialize({ startOnLoad: false });

const MermaidEditorComponent = () => {
  const [code, setCode] = useState('graph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const debouncedCode = useDebounce(code, 500);

  const handleExportSVG = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    if (!output) return;
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(output)}`;
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Set canvas dimensions based on SVG viewbox for better scaling
      const viewBox = output.match(/viewBox="([\d\s\.]+)"/);
      if (viewBox) {
        const dims = viewBox[1].split(' ');
        canvas.width = parseInt(dims[2], 10);
        canvas.height = parseInt(dims[3], 10);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngDataUrl;
        a.download = 'diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    img.src = svgDataUrl;
  };

  const renderDiagram = useCallback(async (diagramCode: string) => {
    if (!diagramCode.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const uniqueId = `mermaid-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(uniqueId, diagramCode);
      setOutput(svg);
      setError('');
    } catch (e: any) {
      // Mermaid throws an error object, not just a string
      setError(e.str || e.message || 'Error rendering diagram.');
      setOutput('');
    }
  }, []);

  useEffect(() => {
    renderDiagram(debouncedCode);
  }, [debouncedCode, renderDiagram]);

  return (
    <div className="p-4 h-full w-full">
      <h1 className="text-2xl font-bold mb-4">Mermaid Editor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-40px)]">
        <TextArea
          initialInput={code}
          onInputChange={setCode}
          title="Mermaid Code"
        />
        <div className="w-full h-full">
          <div className="flex items-center mb-4 gap-4 justify-between">
            <p className="font-bold text-xl">Output:</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-400"
                onClick={handleExportSVG}
                disabled={!output || !!error}
              >
                Export SVG
              </button>
              <button
                type="button"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:bg-gray-400"
                onClick={handleExportPNG}
                disabled={!output || !!error}
              >
                Export PNG
              </button>
            </div>
          </div>
          <div
            className="w-full h-[calc(100%-44px)] p-4 rounded-lg bg-white overflow-scroll"
          >
            {error ? (
              <pre className="text-red-500 whitespace-pre-wrap">{error}</pre>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: output }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MermaidEditorComponent;
