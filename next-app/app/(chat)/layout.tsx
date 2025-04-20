import ChatSidebar from '@/components/layout/chat-sidebar';
import ConnectionBanner from '@/components/custom ui/connection-banner';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import UserProvider from '@/context/auth-context';
import { ChatProvider } from '@/context/chat-context';
import ChatSidebarProvider from '@/context/chat-sidebar-context';
import WebSocketProvider from '@/context/web-socket-context';
import { cookies } from 'next/headers';
import { SidebarLeft } from '@/components/layout/sidebar-left';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <UserProvider>
      <WebSocketProvider>
        <ChatProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <ChatSidebarProvider>
              <SidebarLeft />
              <SidebarInset className='overflow-hidden'>
                <ConnectionBanner />
                {children}
              </SidebarInset>
              <ChatSidebar />
            </ChatSidebarProvider>
          </SidebarProvider>
        </ChatProvider>
      </WebSocketProvider>
    </UserProvider>
  );
}
