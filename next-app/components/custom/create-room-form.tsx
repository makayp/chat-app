'use client';

import clsx from 'clsx';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { useEffect, useState, useTransition } from 'react';
import { createRoom } from '@/lib/actions';
import FormError from './form-error';

export default function CreateRoomForm() {
  const [roomName, setRoomName] = useState('');
  const [formError, setFormError] = useState('');
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const [isCreatingRoom, startTransition] = useTransition();

  useEffect(() => {
    if (!roomName) {
      setFormError('');
      return;
    }
    if (!/^[a-zA-Z0-9-_ ]+$/.test(roomName)) {
      setFormError(
        'Room name can only contain letters, numbers, hyphens, and underscores'
      );
    } else {
      setFormError('');
    }
  }, [roomName]);

  async function handleCreateRoom() {
    setServerError('');
    if (formError) {
      return;
    }

    startTransition(async () => {
      const { data, error } = await createRoom({ roomName });

      if (error || !data) {
        if (error) {
          setServerError(error);
        } else {
          setServerError('An error occurred while creating the room');
        }
        return;
      }

      const { roomId } = data;

      router.push(`/chat/${roomId}`);
    });
  }

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <div className='text-left w-full'>
        <p className='text-foreground/80 mb-2'>Optional</p>
        <Input
          type='text'
          disabled={isCreatingRoom}
          value={roomName}
          aria-invalid={!!formError}
          onChange={(e) => {
            if (serverError) {
              setServerError('');
            }
            setRoomName(e.target.value);
          }}
          placeholder='Room name'
          className={clsx('ring ring-ring')}
        />
      </div>

      {(formError || serverError) && (
        <FormError error={formError || serverError} />
      )}
      <Button
        disabled={!!formError || isCreatingRoom}
        onClick={handleCreateRoom}
        className='w-full'
      >
        {isCreatingRoom ? 'Creating room...' : 'Create room'}
      </Button>
    </div>
  );
}
