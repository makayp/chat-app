'use client';

import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { SidebarTrigger } from '../ui/sidebar';
import ChatSidebarToggle from './chat-sidebar-toggle';

export default function ChatHeader() {
  const { activeRoom, users } = useChat();

  const [userCount, onlineCount] = users.reduce(
    ([userCount, onlineCount], user) => {
      userCount += 1;
      if (user.isOnline) {
        onlineCount += 1;
      }
      return [userCount, onlineCount];
    },
    [0, 0]
  );

  return (
    <header className='sticky top-0 z-10 h-14 bg-background/80 backdrop-blur-lg px-3 overflow-hidden'>
      <div className='flex items-center justify-between gap-4 h-full'>
        <div className='flex items-center overflow-hidden'>
          <SidebarTrigger size='lg' className='mr-2' />

          {activeRoom && (
            <div className='flex flex-col overflow-hidden'>
              <h1 className='font-medium truncate'>{activeRoom.name}</h1>
              <p className='text-xs text-muted-foreground'>
                Members: {userCount}, Online: {onlineCount}
              </p>
            </div>
          )}
        </div>

        {activeRoom && (
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              // onClick={handleLeaveRoom}
              className='text-sm h-8 hidden sm:flex'
            >
              Leave Room
            </Button>

            <ChatSidebarToggle />
          </div>
        )}
      </div>
    </header>
  );
}
