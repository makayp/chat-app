import { ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';
import clsx from 'clsx';
import { useChatSidebar } from '@/context/chat-sidebar-context';
import { cn } from '@/lib/utils';

export default function ChatSidebarToggle({
  className,
}: {
  className?: string;
}) {
  const { showSidebar, toggleSidebar } = useChatSidebar();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleSidebar}
      className={cn('h-8 w-8 lg:hidden', className)}
    >
      <ChevronLeft
        className={clsx('transition-transform', {
          'rotate-180': showSidebar,
        })}
        size={18}
      />
    </Button>
  );
}
