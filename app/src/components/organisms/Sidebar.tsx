import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { createChat, removeChat } from '@/api/chats';
import { ButtonIcon } from '@/components/molecules/ButtonIcon';
import { LinkIcon } from '@/components/molecules/LinkIcon';
import type { ChatResponse } from '@/api/generated/server.client';

interface SidebarProps {
  chats: ChatResponse[];
}

export const Sidebar = ({ chats }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: async (newChat: ChatResponse) => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      navigate(`/chats/${newChat.id}`);
    },
    onError: (error) => {
      throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeChat(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (location.pathname === `/chats/${id}`) {
        navigate('/');
      }
    },
    onError: (error) => {
      throw error;
    },
  });

  return (
    <aside className="bg-neutral flex h-full flex-col">
      <div className="p-4">
        <ButtonIcon
          icon={{ variant: { type: 'outlined', icon: 'add' } }}
          isLoading={createMutation.isPending}
          button={{
            variant: 'default',
            className: 'w-full',
            onClick: () => createMutation.mutate(),
            disabled: createMutation.isPending,
            children: undefined,
          }}
        >
          New Chat
        </ButtonIcon>
      </div>

      <nav className="flex flex-1 overflow-y-auto px-2 py-2">
        <div className="w-full space-y-1">
          {chats.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm">No chats yet</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex justify-between transition-colors hover:bg-gray-200 ${
                  location.pathname === `/chats/${chat.id}` ? 'bg-gray-200' : ''
                }`}
              >
                <LinkIcon
                  to={`/chats/${chat.id}`}
                  icon={{ type: 'outlined', icon: 'chat' }}
                  className="flex-1"
                >
                  {chat.title || 'New Chat'}
                </LinkIcon>

                <ButtonIcon
                  icon={{
                    variant: { type: 'outlined', icon: 'delete' },
                    className: 'text-primary',
                    size: '1.25rem',
                  }}
                  button={{
                    variant: 'ghost',
                    onClick: () => deleteMutation.mutate(chat.id),
                    children: undefined,
                  }}
                />
              </div>
            ))
          )}
        </div>
      </nav>
    </aside>
  );
};
