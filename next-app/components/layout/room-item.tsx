import { cn } from '@/lib/utils';
import { ChatRoom } from '@/types';
import { Copy, LogOut, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';

export default function RoomItem({
  room,
  isMobile,
  isActiveRoom,
}: {
  room: ChatRoom;
  isMobile: boolean;
  isActiveRoom: boolean;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem
      key={room.id}
      className={cn({
        'bg-sidebar-accent/80 rounded-md': isActiveRoom,
      })}
    >
      <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
        <Link href={`/c/${room.id}`}>
          <span>{room.name}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
            <span className='sr-only'>More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-48 rounded-lg'
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/c/${room.id}`
              );
            }}
          >
            <Copy className='text-muted-foreground' />
            <span>Copy Room Link</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className='text-destructive' />
            <span className='text-destructive'>Leave Room</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
