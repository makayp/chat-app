'use client';

import { LogIn, PlusCircle } from 'lucide-react';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { SidebarThemeToggle } from '../custom ui/theme-toggle';
import JoinRoomDialog from './join-room-dialog';
import CreateRoomDialog from './create-room-dialog';

export default function SidebarActions() {
  return (
    <SidebarMenu className='space-y-2'>
      <JoinRoomDialog>
        <SidebarMenuItem>
          <SidebarMenuButton
            variant='outline'
            className='bg-background hover:bg-accent/90 dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80 rounded-3xl border'
            tooltip='Join room'
          >
            <LogIn className='size-4' />
            <span>Join Room</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </JoinRoomDialog>
      <CreateRoomDialog>
        <SidebarMenuItem>
          <SidebarMenuButton
            className='bg-sidebar-primary text-sidebar-primary-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-primary/90 active:bg-sidebar-primary active:text-sidebar-primary-foreground rounded-3xl shadow-sm'
            tooltip='Create room'
          >
            <PlusCircle className='size-4' />
            <span>Create Room</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </CreateRoomDialog>
      <SidebarMenuItem className='rounded-full'>
        <SidebarThemeToggle classNames='mx-auto' />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
