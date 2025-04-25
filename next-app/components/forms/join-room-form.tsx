'use client';

import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FormError from './form-error';
import { Pencil } from 'lucide-react';

const initialErrorState = {
  roomId: '',
  password: '',
  server: '',
};

export default function JoinRoomForm({
  roomId,
  onJoin = () => {},
  className,
}: {
  roomId?: string | null;
  onJoin?: () => void;
  className?: string;
}) {
  const [input, setInput] = useState({
    roomIdInput: roomId || '',
    passwordInput: '',
  });

  const { joinRoom } = useChat();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const { roomIdInput, passwordInput } = input;
  const [formError, setFormError] = useState(initialErrorState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomIdInputDisabled, setRoomIdInputDisabled] = useState(!!roomId);

  const invalidRoomId =
    roomIdInput.length === 0
      ? false
      : !/^[a-zA-Z0-9-_]+$/.test(roomIdInput) || roomIdInput.includes(' ');

  const router = useRouter();

  useEffect(() => {
    if (!passwordRequired) {
      setShowPassword(false);
      setInput((input) => ({
        ...input,
        passwordInput: '',
      }));
    }
  }, [passwordRequired]);

  useEffect(() => {
    if (invalidRoomId) {
      setFormError((error) => ({
        ...error,
        roomId:
          'Room ID can only contain letters, numbers, hyphens and underscores',
      }));
    } else {
      setFormError(initialErrorState);
    }
  }, [roomIdInput, invalidRoomId]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormError(initialErrorState);
    if (e.target.name === 'roomIdInput') {
      if (passwordRequired) setPasswordRequired(false);
    }

    setInput((input) => ({
      ...input,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleJoinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(initialErrorState);
    if (!roomIdInput.trim() || invalidRoomId) {
      setFormError((error) => ({
        ...error,
        roomName: 'Enter a valid room name',
      }));
      return;
    }

    if (passwordRequired && !passwordInput) {
      setFormError((error) => ({
        ...error,
        password: 'Password is required',
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await joinRoom(roomIdInput.trim(), passwordRequired ? passwordInput : '');

      router.push(`/c/${roomIdInput}`);
      onJoin();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Password required') {
          setPasswordRequired(true);
          setRoomIdInputDisabled(true);
        }

        setFormError((prev) => ({
          ...prev,
          server: error.message || 'Failed to join room',
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleJoinRoom}>
      <div className={cn('flex flex-col items-center gap-4 w-full', className)}>
        <div className='w-full relative'>
          <Input
            type='text'
            name='roomIdInput'
            autoComplete='room-id'
            autoFocus
            value={roomIdInput}
            disabled={isSubmitting || roomIdInputDisabled}
            aria-invalid={!!formError.roomId}
            onChange={handleInputChange}
            placeholder='Room ID'
            className='pr-10'
          />
          {roomIdInputDisabled && (
            <Button
              variant='ghost'
              size='sm'
              type='button'
              onClick={() => setRoomIdInputDisabled(false)}
              disabled={isSubmitting}
              className='absolute top-1/2 right-0 transform -translate-y-1/2 p-0 text-xs text-foreground/70 hover:bg-transparent focus-visible:ring-0'
            >
              <Pencil className='size-4' />
            </Button>
          )}
        </div>

        {passwordRequired && (
          <div className='relative w-full'>
            <Input
              type={showPassword ? 'text' : 'password'}
              name='passwordInput'
              autoComplete='current-password'
              value={passwordInput}
              disabled={isSubmitting}
              autoFocus={passwordRequired}
              aria-invalid={!!formError.password}
              onChange={handleInputChange}
              placeholder='Password'
            />
            <Button
              variant='ghost'
              size='sm'
              type='button'
              onClick={() => setShowPassword((show) => !show)}
              className='absolute top-1/2 right-2 transform -translate-y-1/2 p-0 text-xs text-foreground/70 hover:bg-transparent'
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        )}

        {formError.server ? (
          <FormError error={formError.server} />
        ) : (
          Object.values(formError).map(
            (error, index) => error && <FormError key={index} error={error} />
          )
        )}
        <Button
          type='submit'
          disabled={isSubmitting || invalidRoomId}
          className='bg-primary hover:bg-primary/90 text-primary-foreground w-full'
        >
          {isSubmitting ? 'Joining...' : 'Join Room'}
        </Button>
      </div>
    </form>
  );
}
