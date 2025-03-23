'use client';

import UsernameForm from '@/components/custom/username-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define context types
interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
  userId: string;
  setUserId: (id: string) => void;
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook for accessing UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider Component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load username from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (!storedUsername || !storedUserId) {
      setIsModalOpen(true);
    } else {
      setUsername(storedUsername);
      setUserId(storedUserId);
    }
  }, []);

  // Save username and close modal
  const handleSetUsername = (name: string) => {
    localStorage.setItem('username', name);
    setUsername(name);
    setIsModalOpen(false);
  };

  const handleSetUserId = (id: string) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  return (
    <UserContext.Provider
      value={{
        username: username!,
        setUsername: handleSetUsername,
        userId: userId!,
        setUserId: handleSetUserId,
      }}
    >
      {username && children}
      {isModalOpen && (
        <PromptDialog
          isOpen={isModalOpen}
          title='Enter a username'
          description='Enter a friendly username to get started.'
          closeHidden
        >
          <UsernameForm />
        </PromptDialog>
      )}
    </UserContext.Provider>
  );
};

export function PromptDialog({
  isOpen,
  setIsOpen = () => {},
  title,
  description,
  trigger,
  closeHidden = false,
  children,
}: {
  isOpen: boolean;
  setIsOpen?: (open: boolean) => void;
  title: string;
  description: string;
  trigger?: React.ReactNode;
  closeHidden?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent closeHidden={closeHidden} className='space-y-4'>
        <DialogHeader>
          <DialogTitle className='text-center'>{title}</DialogTitle>
          <DialogDescription className='text-center'>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
