"use client";
import React, { useState, useEffect, useMemo } from "react";
import { LoremIpsum } from "lorem-ipsum";
import useDebounce from "@/app/hooks/useDebounce";
import Selector from "@/app/components/common/Selector";
import ReadOnlyTextArea from "@/app/components/common/ReadOnlyTextArea";
import { User } from "@clerk/backend";
import { saveHistory } from "@/utils/clientUtils";
import { ToolType } from "@prisma/client";


const loremIpsum = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

function generateLorem(type: "paragraphs" | "words" | "characters", quantity: number): string {
  if (quantity < 1) return "";
  if (type === "paragraphs") {
    // Ensure paragraphs are separated by double newlines for clear distinction
    return loremIpsum.generateParagraphs(quantity).split('\n').join('\n\n');
  }
  if (type === "words") {
    return loremIpsum.generateWords(quantity);
  }
  // characters
  // Generate more words than needed, then slice to the required character count
  let text = "";
  while (text.length < quantity) {
    text += loremIpsum.generateWords(Math.max(10, quantity / 5)) + " ";
  }
  return text.slice(0, quantity);
}

const options = [
  { label: "Paragraphs", value: "paragraphs" },
  { label: "Words", value: "words" },
  { label: "Characters", value: "characters" },
];


export default function LoremIpsumGeneratorClientComponent(props: { user: User | null; isProUser: boolean }) {
  const { user, isProUser } = props;
  const [type, setType] = useState<"paragraphs" | "words" | "characters">("paragraphs");
  const [quantity, setQuantity] = useState(3);
  const [error, setError] = useState<string | null>(null);

  const lorem = useMemo(() => generateLorem(type, quantity), [type, quantity]);
  const debouncedLorem = useDebounce<string>(lorem, 1000);

  useEffect(() => {
    if (isProUser && user && debouncedLorem) {
      void saveHistory({
        user,
        isProUser,
        toolType: ToolType.LoremIpsumGenerator,
        onError: setError,
        metadata: {
          type,
          quantity,
          debouncedLorem,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLorem, isProUser, user]);


  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col gap-4 mt-4">
      <h1 className="text-3xl font-bold text-white mb-2">Input</h1>
      <div className="flex flex-row gap-4 items-end w-full">
        <div className="flex flex-col">
          <label htmlFor="quantity" className="block font-medium text-white mb-1">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Number(e.target.value))) }
            className="border rounded px-2 py-1 w-28 text-gray-900"
            aria-label="Quantity"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="block font-medium text-white mb-1">Generate by</label>
          <Selector
            values={options}
            handleClick={val => setType(val.value as "paragraphs" | "words" | "characters")}
          />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Output</h2>
      <div className="flex-1 min-h-0 flex flex-col">
        <ReadOnlyTextArea value={lorem} title={''} />
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}