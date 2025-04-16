'use client';

import { useChat } from '@/hooks/use-chat';
import { WifiIcon, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function ConnectionBanner() {
  const { connection } = useChat();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const {
    connect,
    isConnected,
    error: connectionError,
    willReconnect,
    isConnecting,
    isInitialConnect,
  } = connection;

  useEffect(() => {
    if (isConnected && !connectionError) {
      setShowSuccessBanner(true);
      setTimeout(() => {
        setShowSuccessBanner(false);
      }, 3000);
    }
  }, [isConnected, connectionError]);

  return (
    <AnimatePresence>
      {!isConnected && !isConnecting && connectionError && (
        <Banner key='error'>
          <div className='flex items-center justify-center gap-2'>
            <WifiOff size={16} />
            {isInitialConnect && <span>Connection failed.</span>}
            {!isInitialConnect && <span>{connectionError}</span>}

            {willReconnect ? (
              'Reconnecting...'
            ) : (
              <Button
                variant='link'
                size='sm'
                className='text-destructive-foreground underline text-sm p-0 underline-offset-1 hover:text-destructive-foreground/90'
                onClick={() => {
                  connect();
                }}
              >
                Reconnect
              </Button>
            )}
          </div>
        </Banner>
      )}

      {!isConnected && !isConnecting && !connectionError && (
        <Banner key='disconnected' className='bg-accent text-accent-foreground'>
          <div className='flex items-center justify-center gap-2'>
            <WifiOff size={16} />
            <span>{isInitialConnect ? 'Not connected' : 'Disconnected'}</span>
            <Button
              variant='link'
              size='sm'
              className='text-accent-foreground underline text-sm p-0 underline-offset-1'
              onClick={() => {
                connect();
              }}
            >
              Connect
            </Button>
          </div>
        </Banner>
      )}

      {isConnecting && (
        <Banner key='connecting' className='bg-warning'>
          <div className='flex items-center justify-center gap-2'>
            <WifiIcon size={16} className='animate-pulse' />
            <span>
              {isInitialConnect ? 'Connecting...' : 'Reconnecting...'}
            </span>
          </div>
        </Banner>
      )}

      {isConnected && showSuccessBanner && (
        <Banner key='connected' className='bg-success'>
          <div className='flex items-center justify-center gap-2'>
            <WifiIcon size={16} />
            <span>Connected</span>
          </div>
        </Banner>
      )}
    </AnimatePresence>
  );
}

function Banner({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className={clsx('connection-banner', className)}
    >
      {children}
    </motion.div>
  );
}
