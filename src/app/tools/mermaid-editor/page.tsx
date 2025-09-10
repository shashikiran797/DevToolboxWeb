
import MermaidEditorComponent from './MermaidEditorComponent';
import { getUserAndSubscriptionState } from '@/actions/user';

const MermaidEditorPage = async () => {
  const { user, isProUser } = await getUserAndSubscriptionState();
  return <MermaidEditorComponent user={user} isProUser={isProUser} />;
};

export default MermaidEditorPage;
