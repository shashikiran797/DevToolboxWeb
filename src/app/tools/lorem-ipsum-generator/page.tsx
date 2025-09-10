import { getUserAndSubscriptionState } from '@/actions/user';
import LoremIpsumGeneratorClientComponent from './LoremIpsumGeneratorClientComponent';

const LoremIpsumGenerator = async () => {
  const { user, isProUser } = await getUserAndSubscriptionState();
  return <LoremIpsumGeneratorClientComponent user={user} isProUser={isProUser} />;
};
export default LoremIpsumGenerator;
