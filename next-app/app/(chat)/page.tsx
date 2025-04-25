import ChatHeader from '@/components/chat/chat-header';
import CreateRoomDialog from '@/components/layout/create-room-dialog';
import JoinRoomDialog from '@/components/layout/join-room-dialog';
import { Button } from '@/components/ui/button';
import { MessagesSquare } from 'lucide-react';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ roomId: string }>;
}) {
  const { roomId } = await searchParams;

  return (
    <div className='flex-1 flex flex-col overflow-auto no-scrollbar'>
      <ChatHeader />

      <div className='flex flex-col items-center justify-centerd text-center h-full'>
        <div className='flex flex-col items-center gap-2 mt-20 p-2'>
          <MessagesSquare className='size-12 stroke-[1.5px]' />
          <p className='text-lg text-foreground/80'>
            Please select, create or join a chat room <br /> to get started.
          </p>

          <div className='flex flex-col md:flex-row items-center justify-center gap-4 mt-8'>
            <JoinRoomDialog roomId={roomId}>
              <Button>Join Room</Button>
            </JoinRoomDialog>
            <CreateRoomDialog>
              <Button variant='outline'>Create Room</Button>
            </CreateRoomDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
