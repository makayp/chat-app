'use client';

import { useState } from 'react';
import CreateRoomForm from '../forms/create-room-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export default function CreateRoomDialog({
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
            Create a Room
          </DialogTitle>
          <DialogDescription className='text-center'>
            Enter a name for the new room.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-2'>
          <CreateRoomForm onCreate={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
