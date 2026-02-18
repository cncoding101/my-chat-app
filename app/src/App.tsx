import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAllChats } from '@/api/chats';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { LoadingScreen } from '@/components/molecules/LoadingScreen';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';
import { Sidebar } from '@/components/organisms/Sidebar';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { useNavbarStore } from '@/stores/navbar';

const Layout = () => {
  const { isOpen, toggle } = useNavbarStore();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchAllChats,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="grid h-screen grid-cols-12 overflow-hidden">
      {isOpen && (
        <aside className="col-span-2 transition-all duration-300">
          <Sidebar chats={chats ?? []} />
        </aside>
      )}

      <div
        className={`flex h-full flex-col ${isOpen ? 'md:col-span-10' : 'md:col-span-12'}`}
      >
        <header className="sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle sidebar"
            >
              <Icon variant={{ type: 'outlined', icon: 'menu' }} />
            </Button>
            <Text variant="heading" className="text-xl font-semibold">
              My Chat App
            </Text>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <GlobalErrorHandler>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="chats/:id" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </GlobalErrorHandler>
  );
};
