import ChatHeader from '@/components/custom/chat-header';
import ChatSidebar from '@/components/custom/chat-sidebar';
import ConnectionBanner from '@/components/custom/connection-banner';
import { SidebarLeft } from '@/components/custom/sidebar-left';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import UserProvider from '@/context/auth-context';
import { ChatProvider } from '@/context/chat-context';
import ChatSidebarProvider from '@/context/chat-sidebar-context';
import WebSocketProvider from '@/context/web-socket-context';
import { cookies } from 'next/headers';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <UserProvider>
      <ChatProvider>
        <WebSocketProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <ChatSidebarProvider>
              <SidebarLeft />
              <SidebarInset className='overflow-hidden'>
                <ConnectionBanner />
                <ChatHeader />
                <Separator className='max-w-[calc(100%-24px)] mx-auto mb-4' />
                {children}
              </SidebarInset>
              <ChatSidebar />
            </ChatSidebarProvider>
          </SidebarProvider>
        </WebSocketProvider>
      </ChatProvider>
    </UserProvider>
  );
}
