import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message as MessageType, User } from '@/types';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock3 } from 'lucide-react';
import FilePreview from './file-preview';

interface MessageProps {
  sender?: User;
  message: MessageType;
  isOwn: boolean;
}

export default function Message({ message, isOwn, sender }: MessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('group text-[15px] flex flex-col mb-4 overflow-hidden', {
        'items-end ml-auto': isOwn,
        'items-start': !isOwn,
      })}
    >
      {!isOwn && (
        <span className='flex items-center gap-2 text-xs text-muted-foreground ml-3 mb-1'>
          {sender?.username || 'Unknown'}
        </span>
      )}

      <div
        className={cn(
          'rounded-xl p-1.5 max-w-[75%] md:max-w-[60%] bg-amber-600',
          {
            'bg-primary text-primary-foreground ml-auto': isOwn,
            'bg-accent text-accent-foreground mr-auto': !isOwn,
            'max-w-2xs md:max-w-sm': message.files && message.files.length > 0,
          }
        )}
      >
        {message.files && message.files.length > 0 && (
          <FilePreview files={message.files} />
        )}

        <div className='px-1'>
          <p className='break-words whitespace-pre-wrap'>{message.content}</p>

          <div
            className={`flex items-center text-[10px] gap-1 mt-1 opacity-70 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>{formattedTime}</span>

            {isOwn && (
              <span className='flex items-center'>
                {message.status === 'sending' && <Clock3 className='size-3' />}
                {message.status === 'sent' && <Check className='size-3.5' />}
                {message.status === 'delivered' && (
                  <CheckCheck className='size-3.5' />
                )}
                {message.status === 'read' && (
                  <CheckCheck className='text-green-400 size-3.5' />
                )}
                {message.status === 'failed' && (
                  <span className='text-destructive'>Failed</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {isOwn && message.status === 'failed' && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {}}
          className='text-xs h-7 mt-1 text-destructive hover:text-destructive/90'
        >
          Retry
        </Button>
      )}
    </motion.div>
  );
}
