'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { checkRoomPrivacy } from '@/lib/actions';
import FormError from './form-error';

export default function JoinRoomForm() {
  const [roomId, setRoomId] = useState('');
  const [formError, setFormError] = useState('');
  const [serverError, setServerError] = useState('');

  const [isJoining, startTransition] = useTransition();

  const router = useRouter();

  useEffect(() => {
    if (!roomId) {
      setFormError('');
      return;
    }
    if (roomId.includes(' ')) {
      setFormError('Room ID cannot contain spaces');
    } else if (!/^[a-zA-Z0-9-_]+$/.test(roomId)) {
      setFormError(
        'Room ID can only contain letters, numbers, hyphens, and underscores'
      );
    } else {
      setFormError('');
    }
  }, [roomId]);

  function handleJoinRoom() {
    if (!roomId.trim()) {
      setFormError('Room ID is required');
      return;
    }

    startTransition(async () => {
      const { data, error } = await checkRoomPrivacy({ roomId });

      if (error || !data) {
        if (error) {
          setServerError(error);
        } else {
          setServerError('An error occurred, please try again');
        }
        return;
      }

      if (data.isPrivate) {
        router.push(`/chat/${roomId}/join`);
        return;
      }

      router.push(`/chat/${roomId}`);
    });
  }

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <Input
        type='text'
        value={roomId}
        disabled={isJoining}
        aria-invalid={!!formError}
        onChange={(e) => {
          if (serverError) {
            setServerError('');
          }
          setRoomId(e.target.value);
        }}
        placeholder='Room ID'
        className={clsx('ring ring-ring')}
      />

      {(formError || serverError) && (
        <FormError error={formError || serverError} />
      )}
      <Button
        onClick={handleJoinRoom}
        disabled={!!formError || isJoining}
        className='bg-blue-600 hover:bg-blue-600/90 text-white w-full'
      >
        {isJoining ? 'Joining...' : 'Join Room'}
      </Button>
    </div>
  );
}
