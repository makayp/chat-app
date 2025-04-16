'use client';

import { ArrowLeftCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CreateRoomForm from '../forms/create-room-form';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export default function CreateRoomDialog({
  mode,
  children,
}: {
  mode?: 'join' | 'create';
  children: React.ReactNode;
}) {
  // const [open, setOpen] = useState(defaultMode === 'create');
  const router = useRouter();

  function handleUrlChange(mode?: 'join' | 'create') {
    router.replace(window.location.pathname + (mode ? `?mode=${mode}` : ''));
  }

  return (
    <Dialog
      // defaultOpen={open}
      open={mode === 'create'}
      onOpenChange={(open) => {
        if (open) {
          // setOpen(true);
          handleUrlChange('create');
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
            Create a Room
          </DialogTitle>
          <DialogDescription className='text-center'>
            Enter a name for the new room.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-8'>
          <CreateRoomForm />

          <Button
            asChild
            variant='link'
            onClick={() => {
              handleUrlChange('join');
              // setOpen(false);
            }}
            className='w-fit mx-auto hover:no-underline text-foreground hover:text-foreground/90'
          >
            <span>
              <ArrowLeftCircle size={24} /> Join room
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
