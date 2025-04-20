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

export default function JoinRoomDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <JoinRoomForm onJoin={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
