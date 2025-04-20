import React, { useEffect, useRef } from 'react';
import { Message as MessageType, User } from '@/types';
import Message from './message';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TypingIndicator from '../../custom ui/typing-indicator';

interface MessageListProps {
  messages: MessageType[];
  typingUsers: User[];
  users: User[];
  currentUserId: string;
  className?: string;
}

export default function MessageList({
  messages,
  users,
  typingUsers,
  currentUserId,
  className,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, typingUsers]);

  return (
    <div className={cn('flex-1 px-4 py-8', className)}>
      {messages.length === 0 && typingUsers.length === 0 ? (
        <div className='flex h-full items-center justify-center'>
          <p className='text-muted-foreground text-center'>
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <div className='space-y-1'>
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              sender={users.find((user) => user.id === message.from)}
              isOwn={message.from === currentUserId}
            />
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className='flex flex-col ml-3 mb-4 mt-12k'
            >
              <span className='text-xs text-muted-foreground'>
                {typingUsers.length === 1
                  ? `${typingUsers[0].username} is typing...`
                  : 'Multiple people are typing...'}
              </span>

              <TypingIndicator />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
