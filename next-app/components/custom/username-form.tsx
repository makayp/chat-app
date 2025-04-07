'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import clsx from 'clsx';
import FormError from './form-error';
import { useAuth } from '@/context/auth-context';

export default function UsernameForm() {
  const [formError, setFormError] = useState('');

  const { username, setUsername } = useAuth();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || !!formError) {
      setFormError('Username is required');
      return;
    }
    setUsername(inputValue);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-col items-center gap-4 w-full'>
        <Input
          type='text'
          autoFocus
          value={inputValue}
          aria-invalid={!!formError}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Username'
          className={clsx('ring ring-ring')}
        />

        {formError && <FormError error={formError} />}
        <Button
          type='submit'
          onClick={handleSubmit}
          disabled={!!formError}
          className='bg-primary hover:bg-primary/90 text-primary-foreground w-full'
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
