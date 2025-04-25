import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { AlertDialog } from '../layout/alert-dialog';
import { Button } from '../ui/button';

interface LeaveRoomButtonProps {
  roomId: string;
  className?: string;
  onClick?: () => void;
}

export default function LeaveRoomButton({
  roomId,
  className = '',
  onClick = () => {},
}: LeaveRoomButtonProps) {
  const { leaveRoom } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  async function handleLeaveRoom() {
    try {
      setIsLoading(true);
      await leaveRoom(roomId);
      setIsAlertOpen(false);
    } catch (error) {
      console.error('Error leaving room:', error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <AlertDialog
      isOpen={isAlertOpen}
      setIsOpen={setIsAlertOpen}
      variant='leave-room'
      onConfirm={() => {
        handleLeaveRoom();
      }}
    >
      <Button
        variant='destructive'
        className={cn('w-full text-sm', className)}
        disabled={isLoading}
        onClick={() => {
          onClick();
        }}
      >
        <LogOut className='size-4' />
        <span>Leave Room</span>
      </Button>
    </AlertDialog>
  );
}
