'use client';

import { MessageSquare } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useChat } from '@/hooks/use-chat';
import RoomItem from './room-item';

export default function NavRooms() {
  const { isMobile, open, setOpen } = useSidebar();
  const { rooms, connection } = useChat();
  const { isConnecting, isInitialConnect, error } = connection;

  return (
    <SidebarGroup className='flex-1 py-4'>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip='Joined Rooms'
            className='hover:bg-transparent hover:text-sidebar-foreground active:text-sidebar-foreground active:bg-transparent text font-semibold whitespace-nowrap'
            onClick={() => {
              if (!isMobile && !open) setOpen(true);
            }}
          >
            <MessageSquare className='!size-4.5 stroke-[2.2px]' />

            <span>Chat Rooms</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div className='group-data-[collapsible=icon]:hidden h-full flex flex-col'>
        {rooms.length === 0 && (
          <div className='flex-1 text-center flex flex-col items-center justify-center'>
            {!isInitialConnect && (
              <span className='text-sm text-muted-foreground text-center'>
                No chat rooms available
              </span>
            )}
            {isConnecting && isInitialConnect && (
              <span className='text-sm text-muted-foreground'>
                Loading chat rooms...
              </span>
            )}
            {isInitialConnect && error && !isConnecting && (
              <span className='text-sm text-muted-foreground'>
                Failed to load chat rooms
              </span>
            )}
          </div>
        )}

        {rooms.length > 0 && (
          <SidebarMenu>
            {rooms.map((room) => (
              <RoomItem key={room.id} room={room} isMobile={isMobile} />
            ))}
          </SidebarMenu>
        )}
      </div>
    </SidebarGroup>
  );
}
