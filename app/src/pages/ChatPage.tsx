import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchChatById } from '@/api/chats';
import { Text } from '@/components/atoms/Text';
import { LoadingScreen } from '@/components/molecules/LoadingScreen';
import { Chat } from '@/components/organisms/Chat';

export const ChatPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: chat, isLoading, error } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => fetchChatById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingScreen title="Loading chat..." />;
  }

  if (error || !chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text variant="paragraph">Chat not found</Text>
      </div>
    );
  }

  return <Chat key={chat.id} initialMessages={chat.messages} chatId={chat.id} />;
};
