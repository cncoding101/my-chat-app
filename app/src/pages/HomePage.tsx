import { Text } from '@/components/atoms/Text';

export const HomePage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <Text variant="heading">Hello, User!</Text>
      <Text variant="paragraph">Select a chat from the sidebar or start a new one.</Text>
    </div>
  );
};
