import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import { Separator } from '../ui/separator';

import SidebarActions from './sidebar-actions';
import RoomList from './room-list';
import User from '../custom ui/User';

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
        <RoomList />
      </SidebarContent>

      <SidebarFooter>
        <SidebarActions />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
