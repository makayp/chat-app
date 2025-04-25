'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useChatSidebar } from '@/context/chat-sidebar-context';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { Share, Users } from 'lucide-react';
import LeaveRoomButton from '../custom ui/leave-room-button';
import Overlay from '../custom ui/overlay';
import ChatSidebarToggle from './chat-sidebar-toggle';
import UserList from './user-list';
import { ShareDialog } from '../custom ui/share-dialog';

export default function ChatSidebar() {
  const { activeRoomId } = useChat();
  const { setShowSidebar, showSidebar } = useChatSidebar();

  if (!activeRoomId) return null;

  return (
    <>
      {showSidebar && (
        <Overlay className='lg:hidden' onClick={() => setShowSidebar(false)} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 w-72 bg-sidebar text-sidebar-foreground border-l border-border lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out z-50',
          {
            'translate-x-0': showSidebar,
            'translate-x-full': !showSidebar,
          }
        )}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center gap-2 h-14 px-4 font-medium'>
            <Users size={18} />
            <span>People</span>
            <ChatSidebarToggle className='ml-auto' />
          </div>

          <Separator className='max-w-[calc(100%-24px)] mx-auto mb-4' />

          {/* Content */}
          <div className='flex-1 overflow-y-auto scrollbar-thin px-4'>
            <UserList />
          </div>

          {/* Footer */}
          <div className='mt-4 space-y-2 p-4'>
            <ShareDialog>
              <Button
                variant='outline'
                className='w-full text-sm shadow-nonef bg-background hover:bg-accent dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80'
              >
                <Share className='size-4' />
                <span>Share Room</span>
              </Button>
            </ShareDialog>

            <LeaveRoomButton roomId={activeRoomId} />
          </div>
        </div>
      </aside>
    </>
  );
}
