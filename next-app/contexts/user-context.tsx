'use client';

import UsernameForm from '@/components/custom/username-form';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define context types
interface UserContextType {
  username: string | null;
  setUsername: (name: string) => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load username from localStorage on mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      setIsModalOpen(true);
    } else {
      setUsername(storedUsername);
    }
  }, []);

  // Save username and close modal
  const handleSetUsername = (name: string) => {
    localStorage.setItem('username', name);
    setUsername(name);
    setIsModalOpen(false);
  };

  return (
    <UserContext.Provider value={{ username, setUsername: handleSetUsername }}>
      {children}
      {isModalOpen && <UsernameModal isOpen={isModalOpen} />}
    </UserContext.Provider>
  );
};

// Username Modal Component
function UsernameModal({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={isOpen}>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent closeHidden className='border-sidebar-border space-y-4'>
        <DialogHeader>
          <DialogTitle>Enter a username</DialogTitle>
          <DialogDescription>
            Enter a friendly username to start chatting.
          </DialogDescription>
        </DialogHeader>
        <UsernameForm />
      </DialogContent>
    </Dialog>
  );
}
