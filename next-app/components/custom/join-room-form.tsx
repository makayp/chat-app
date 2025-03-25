'use client';

import { useUser } from '@/contexts/user-context';
import { joinRoom } from '@/lib/actions';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FormError from './form-error';
import { generateToken } from '@/lib/utils.server';

const initialErrorState = {
  roomId: '',
  password: '',
  server: '',
};

export default function JoinRoomForm({
  roomId,
  className,
}: {
  roomId?: string | null;
  className?: string;
}) {
  const [input, setInput] = useState({
    roomIdInput: roomId || '',
    passwordInput: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [passwordRequired, setPasswordRequired] = useState(false);
  const { roomIdInput, passwordInput } = input;

  const invalidRoomId =
    roomIdInput.length === 0
      ? false
      : !/^[a-zA-Z0-9-_]+$/.test(roomIdInput) || roomIdInput.includes(' ');

  const [formError, setFormError] = useState(initialErrorState);

  const { username, userId } = useUser();

  const [isJoining, startTransition] = useTransition();

  const router = useRouter();

  // useEffect(() => {
  //   if (roomId) handleJoinRoom();
  // }, []);

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

  function handleJoinRoom(e: React.MouseEvent<HTMLButtonElement>) {
    setFormError(initialErrorState);
    e.preventDefault();
    if (!roomIdInput.trim() || (passwordRequired && !passwordInput)) {
      if (!roomIdInput.trim()) {
        setFormError((error) => ({ ...error, roomId: 'Room ID is required' }));
      }

      if (passwordRequired && !passwordInput) {
        setFormError((error) => ({
          ...error,
          password: 'Password is required',
        }));
      }

      return;
    }

    startTransition(async () => {
      const accessToken = await generateToken({ userId, username });

      console.log('Generating join token:', accessToken);

      const { success, error } = await joinRoom({
        roomId: roomIdInput,
        userToken: accessToken,
        password: passwordRequired ? passwordInput : undefined,
      });

      if (error || !success) {
        if (error) {
          if (error === 'Room does not exist') {
            setFormError((error) => ({
              ...error,
              roomId: 'Room does not exist',
            }));
          } else if (passwordRequired && error === 'Invalid password') {
            setFormError((error) => ({
              ...error,
              password: 'Invalid password',
            }));
          } else if (error === 'Password is required') {
            setPasswordRequired(true);
          } else {
            setFormError((e) => ({
              ...e,
              server: error,
            }));
          }
          return;
        }
      }

      router.push(`/chat/${input.roomIdInput}`);
    });
  }

  return (
    <form>
      <div
        className={clsx('flex flex-col items-center gap-4 w-full', className)}
      >
        <Input
          type='text'
          name='roomIdInput'
          autoComplete='room-id'
          autoFocus
          value={roomIdInput}
          disabled={isJoining}
          aria-invalid={!!formError.roomId}
          onChange={handleInputChange}
          placeholder='Room ID'
        />

        {!passwordRequired && (
          <div className='relative w-full'>
            <Input
              type={showPassword ? 'text' : 'password'}
              name='passwordInput'
              autoComplete='current-password'
              value={passwordInput}
              disabled={isJoining}
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
          onClick={handleJoinRoom}
          disabled={isJoining || invalidRoomId}
          className='bg-primary hover:bg-primary/90 text-primary-foreground w-full'
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </Button>
      </div>
    </form>
  );
}
