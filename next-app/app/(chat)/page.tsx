import ChatHeader from '@/components/chat/chat-header';
import CreateRoomDialog from '@/components/layout/create-room-dialog';
import JoinRoomDialog from '@/components/layout/join-room-dialog';
import { Button } from '@/components/ui/button';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mode?: 'join' | 'create' }>;
}) {
  const { mode } = await searchParams;

  return (
    <div className='flex flex-col overflow-autoh no-scrollbar'>
      <ChatHeader />

      <div className='flex-1 text-center px-4 py-4'>
        <p className='text-lg text-foreground/80 mt-20'>
          Please select, create or join a chat room <br /> to get started.
        </p>

        <div className='flex flex-col md:flex-row items-center justify-center gap-4 mt-8'>
          <JoinRoomDialog mode={mode}>
            <Button size='sm'>Join Room</Button>
          </JoinRoomDialog>
          <CreateRoomDialog mode={mode}>
            <Button size='sm' variant='outline'>
              Create Room
            </Button>
          </CreateRoomDialog>
        </div>
      </div>
    </div>
  );
}
