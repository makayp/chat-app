'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import clsx from 'clsx';

import FormError from './form-error';
import { useUser } from '@/contexts/user-context';

export default function UsernameForm() {
  const [formError, setFormError] = useState('');

  const { username, setUsername } = useUser();
  const [inputValue, setInputValue] = useState(username || '');

  useEffect(() => {
    if (!inputValue.trim()) {
      setFormError('');
      return;
    }
    if (inputValue.includes(' ')) {
      setFormError('Username cannot contain spaces');
    } else if (!/^[a-zA-Z0-9-_]+$/.test(inputValue)) {
      setFormError(
        'Usernames can only contain letters, numbers, hyphens, and underscores'
      );
    } else {
      setFormError('');
    }
  }, [inputValue]);

  function handleSubmit() {
    if (!inputValue.trim()) {
      setFormError('Username is required');
      return;
    }

    setUsername(inputValue);
  }

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <Input
        type='text'
        value={inputValue}
        aria-invalid={!!formError}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder='Username'
        className={clsx('ring ring-ring')}
      />

      {formError && <FormError error={formError} />}
      <Button
        onClick={handleSubmit}
        disabled={!!formError}
        className='bg-blue-600 hover:bg-blue-600/90 text-white'
      >
        Continue
      </Button>
    </div>
  );
}
