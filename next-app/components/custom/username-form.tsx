'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import clsx from 'clsx';
import FormError from './form-error';
import { useUser } from '@/contexts/user-context';
import { v4 as uuid } from 'uuid';

export default function UsernameForm() {
  const [formError, setFormError] = useState('');

  const { username, userId, setUsername, setUserId } = useUser();
  const [inputValue, setInputValue] = useState(username || '');

  const invalidUsername =
    inputValue.length === 0
      ? false
      : inputValue.includes(' ') || !/^[a-zA-Z0-9-_]+$/.test(inputValue);

  useEffect(() => {
    if (invalidUsername) {
      setFormError(
        'Usernames can only contain letters, numbers, hyphens, and underscores'
      );
    } else {
      setFormError('');
    }
  }, [inputValue, invalidUsername]);

  async function handleSubmit() {
    if (!inputValue.trim()) {
      setFormError('Username is required');
      return;
    }

    console.log(userId);

    const id = uuid();

    setUsername(inputValue);
    setUserId(id);
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
        className='bg-primary hover:bg-primary/90 text-primary-foreground w-full'
      >
        Continue
      </Button>
    </div>
  );
}
