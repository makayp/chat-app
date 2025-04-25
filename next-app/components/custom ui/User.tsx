'use client';

import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';
import clsx from 'clsx';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';

export default function User() {
  const { username } = useAuth();
  const { state: sidebarState } = useSidebar();
  const { connection } = useChat();
  const { isConnected, isConnecting } = connection;
  const userState = isConnected
    ? 'Online'
    : isConnected
    ? 'Connecting'
    : 'Offline';
  const UserInitials = username ? username.slice(0, 1).toUpperCase() : 'U';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={`${username} (${userState})`}
          size='lg'
          className='hover:bg-transparent hover:text-sidebar-foreground active:text-sidebar-foreground active:bg-transparent'
        >
          <Avatar className='overflow-visible'>
            <AvatarFallback className='h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground overflow-visible'>
              {UserInitials}
              {sidebarState === 'collapsed' && (
                <span
                  className={clsx(
                    'absolute right-0  bottom-0.5 size-2 bg-gray-300 rounded-full hidden md:flex',
                    {
                      'bg-green-500': isConnected,
                      'bg-yellow-500': isConnecting,
                    }
                  )}
                />
              )}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col flex-1 text-left text-sm leading-tight overflow-hidden'>
            <p className='font-medium truncate'>{username || 'User'}</p>
            <div className='flex items-center gap-1'>
              <span
                className={clsx('size-2 bg-gray-300 rounded-full', {
                  'bg-green-500': isConnected,
                  'bg-yellow-500': isConnecting,
                })}
              />

              <span className='text-xs text-muted-foreground'>
                {isConnecting
                  ? 'Connecting'
                  : isConnected
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
