'use client';

import UsernameForm from '@/components/forms/username-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface Session {
  sessionId: string | null;
  username: string | null;
  userId: string | null;
}

// Define context types
interface AuthContextType {
  sessionId: string | null;
  username: string | null;
  userId: string | null;
  setUsername: (username: string) => void;
  setSession: (user: Session) => void;
  setUsernameRequired: (required: boolean) => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUserState: Session = {
  sessionId: '',
  username: '',
  userId: '',
};

// Provider Component
export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session>(initialUserState);

  const [usernameRequired, setUsernameRequired] = useState(false);

  const setUsername = useCallback((name: string) => {
    setSession((prev) => {
      localStorage.setItem(
        'session',
        JSON.stringify({ ...prev, username: name })
      );

      return {
        ...prev,
        username: name,
      };
    });

    setUsernameRequired(false);
  }, []);

  const handleSetSession = useCallback(
    (user: Session) => {
      setSession(user);
      localStorage.setItem('session', JSON.stringify(user));
    },
    [setSession]
  );

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('session');

    if (!savedSession) {
      setUsernameRequired(true);
      return;
    }

    const parsedSession = JSON.parse(savedSession);

    if (!parsedSession.username && !parsedSession.sessionId) {
      setUsernameRequired(true);
      return;
    }

    setSession(parsedSession);
  }, [setUsername]);

  return (
    <AuthContext.Provider
      value={{
        username: session.username,
        userId: session.userId,
        sessionId: session.sessionId,
        setUsername,
        setUsernameRequired,
        setSession: handleSetSession,
      }}
    >
      {session.username || session.sessionId ? (
        children
      ) : (
        <PromptDialog
          isOpen={usernameRequired}
          title='Enter a username'
          description='Enter a friendly username to get started.'
          closeHidden
        >
          <UsernameForm />
        </PromptDialog>
      )}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
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
