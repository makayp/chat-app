'use client';

import { useChat } from '@/hooks/use-chat';
import { WifiIcon, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
    <div>
      <AnimatePresence>
        {!isConnected && !isConnecting && (
          <SlideInOut key='error' className='connection-banner'>
            {connectionError && (
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
            )}
            {!connectionError && !isInitialConnect && (
              <div className='flex items-center justify-center gap-2'>
                <WifiOff size={16} />
                <span>Disconnected</span>
              </div>
            )}
          </SlideInOut>
        )}
        <AnimatePresence>
          {isConnecting && (
            <SlideInOut
              key='connecting'
              className='connection-banner bg-warning'
            >
              <div className='flex items-center justify-center gap-2'>
                <WifiIcon size={16} className='animate-pulse' />
                <span>
                  {isInitialConnect ? 'Connecting...' : 'Reconnecting...'}
                </span>
              </div>
            </SlideInOut>
          )}
        </AnimatePresence>

        {isConnected && showSuccessBanner && (
          <SlideInOut key='connected' className='connection-banner bg-success'>
            <div className='flex items-center justify-center gap-2'>
              <WifiIcon size={16} />
              <span>Connected</span>
            </div>
          </SlideInOut>
        )}
      </AnimatePresence>
    </div>
  );
}

function SlideInOut({
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
      className={className}
    >
      {children}
    </motion.div>
  );
}
