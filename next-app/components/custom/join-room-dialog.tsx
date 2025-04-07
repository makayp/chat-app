'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import JoinRoomForm from './join-room-form';

export default function JoinRoomDialog({
  mode,
  children,
}: {
  mode?: 'join' | 'create';
  children: React.ReactNode;
}) {
  // const [open, setOpen] = useState(mode === 'join');
  const router = useRouter();

  function handleUrlChange(mode?: 'join' | 'create') {
    router.replace(window.location.pathname + (mode ? `?mode=${mode}` : ''));
  }

  return (
    <Dialog
      // defaultOpen={open}
      open={mode === 'join'}
      onOpenChange={(open) => {
        if (open) {
          // setOpen(true);
          handleUrlChange('join');
        } else {
          // setOpen(false);
          handleUrlChange();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className='text-center sm:max-w-md'>
        <DialogHeader className='mt-5'>
          <DialogTitle className='text-center font-medium'>
            Join a Room
          </DialogTitle>
          <DialogDescription className='text-center'>
            Enter a room ID to join an existing room.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-8'>
          <JoinRoomForm />
          <p>Or</p>
          <Button
            variant='outline'
            onClick={() => {
              // setOpen(false);
              handleUrlChange('create');
            }}
            className='w-fit mx-auto shadow-sm'
          >
            Create room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
