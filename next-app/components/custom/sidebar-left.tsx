import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import { Separator } from '../ui/separator';
import User from './User';
import NavRooms from './nav-rooms';
import SidebarActions from './sidebar-actions';

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='h-14 flex flex-row items-center '>
        <User />
      </SidebarHeader>

      <Separator className='max-w-[calc(100%-24px)] mx-auto' />

      <SidebarContent>
        <NavRooms />
      </SidebarContent>

      <SidebarFooter>
        <SidebarActions />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
