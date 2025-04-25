'use client';

import { useState } from 'react';
import JoinRoomForm from '../forms/join-room-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useRouter } from 'next/navigation';

export default function JoinRoomDialog({
  roomId,
  children,
}: {
  roomId?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!roomId);
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (roomId) {
          router.push(window.location.pathname);
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

        <JoinRoomForm onJoin={() => setOpen(false)} roomId={roomId} />
      </DialogContent>
    </Dialog>
  );
}
