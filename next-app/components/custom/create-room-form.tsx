'use client';

import { useChat } from '@/hooks/use-chat';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import FormError from './form-error';

const initialErrorState = {
  roomName: '',
  password: '',
  server: '',
};

export default function CreateRoomForm() {
  const [formError, setFormError] = useState(initialErrorState);
  const [isPrivate, setIsPrivate] = useState(false);

  const [{ roomName, passwordInput }, setInput] = useState({
    roomName: '',
    passwordInput: '',
  });

  const { createRoom } = useChat();

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const invalidRoomName =
    roomName.length === 0 ? false : !/^[a-zA-Z0-9-_' ]+$/.test(roomName);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormError(initialErrorState);

    setInput((input) => ({
      ...input,
      [e.target.name]: e.target.value,
    }));
  }

  useEffect(() => {
    if (invalidRoomName) {
      setFormError((error) => ({
        ...error,
        roomName: "Room name can only contain (a-z, A-Z, 0-9, -, _, ')",
      }));
    } else {
      setFormError(initialErrorState);
    }
  }, [invalidRoomName, roomName]);

  async function handleCreateRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(initialErrorState);
    if (!roomName.trim() || invalidRoomName) {
      setFormError((error) => ({
        ...error,
        roomName: 'Enter a valid room name',
      }));
      return;
    }

    if (isPrivate && !passwordInput.trim()) {
      setFormError((error) => ({
        ...error,
        password: 'Enter a valid password',
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom(
        roomName.trim(),
        isPrivate ? passwordInput.trim() : ''
      );

      if (!room) {
        setFormError((error) => ({
          ...error,
          server: 'Failed to create room',
        }));
        return;
      }

      router.push(`/chat/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setFormError((error) => ({
        ...error,
        server: 'Failed to create room',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleCreateRoom}>
      <div className='flex flex-col items-center gap-4 w-full'>
        <div className='text-left w-full'>
          <div className='flex items-center gap-2 mb-2 w-fit ml-auto'>
            <label htmlFor='isPrivate' className='text-sm'>
              Private Room (Password Protected)
            </label>
            <Switch
              id='isPrivate'
              name='isPrivate'
              checked={isPrivate}
              onCheckedChange={(checked) => {
                setIsPrivate(checked);
                setFormError(initialErrorState);
                setInput((input) => ({
                  ...input,
                  passwordInput: '',
                }));
                setShowPassword(false);
              }}
            />
          </div>

          <Input
            type='text'
            name='roomName'
            disabled={isSubmitting}
            value={roomName}
            aria-invalid={!!formError.roomName}
            onChange={handleInputChange}
            placeholder='Room name'
          />
        </div>

        {isPrivate && (
          <div className='relative w-full'>
            <Input
              type={showPassword ? 'text' : 'password'}
              name='passwordInput'
              autoComplete='current-password'
              value={passwordInput}
              disabled={isSubmitting}
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
          disabled={
            isSubmitting || !!formError.roomName || !!formError.password
          }
          className='w-full'
        >
          {isSubmitting ? 'Creating room...' : 'Create room'}
        </Button>
      </div>
    </form>
  );
}
