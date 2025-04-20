import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/use-chat';
import { Plus, SendHorizonal, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

export default function MessageInput() {
  const [message, setMessage] = useState('');

  const {
    sendMessage,
    setTyping,
    pendingFiles,
    addPendingFile,
    removePendingFile,
  } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() || pendingFiles.length > 0) {
      sendMessage(message);
      setMessage('');
      setTyping(false);

      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        addPendingFile(file);
      });
    }

    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [message]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 0
      }px`;
    }
  };

  // Send typing indicator when user is typing
  useEffect(() => {
    if (message.trim()) {
      // Prevent multiple timeouts from being set
      // Prevent the typing indicator from being sent multiple times
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      } else {
        setTyping(true);
      }

      // Set new timeout to clear typing indicator
      timeoutRef.current = setTimeout(() => {
        setTyping(false);
        timeoutRef.current = null;
      }, 1000 * 5);
    } else {
      // If the message is empty, clear the typing indicator
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, setTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        setTyping(false);
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setTyping]);

  return (
    <div className='sticky bottom-0'>
      {/* File previews */}

      {pendingFiles.length > 0 && (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3 w-fit mb-2 mx-auto bg-background/80 backdrop-blur-lg p-2 border border-border shadow-sm rounded-lg max-w-[calc(100%-2rem)]'>
          {pendingFiles.map((file, index) => (
            <div
              key={index}
              className='size-18 rounded-lg relative overflow-hidden'
            >
              {file.type.startsWith('image/') ? (
                <Image
                  src={URL.createObjectURL(file)}
                  fill
                  alt={file.name}
                  className='object-cover'
                />
              ) : (
                <div className='h-full w-full flex items-center justify-center bg-muted text-xs p-1 whitespace-nowrap overflow-hidden'>
                  {file.name}
                </div>
              )}

              <Button
                variant='ghost'
                size='icon'
                onClick={() => removePendingFile(file.name)}
                className='absolute top-0 right-0 h-5 w-5 bg-background/90 hover:bg-background/50 rounded-full p-0 m-1'
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className='sticky bottom-0 bg-background/80 backdrop-blur-lg p-4 border-t border-border'>
        <div className='flex items-end gap-2'>
          <Button
            variant='ghost'
            onClick={() => fileInputRef.current?.click()}
            className='text-foreground/80 hover:text-foreground/70 size-10 rounded-3xl'
          >
            <Plus className='size-5' />
          </Button>

          <div className='relative flex gap-2 items-end flex-1'>
            <Textarea
              ref={textareaRef}
              placeholder='Type a message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className='min-h-10 max-h-[40dvh] resize-none rounded-3xl ring ring-ring/50 text-sm'
              autoFocus
            />

            <input
              ref={fileInputRef}
              type='file'
              onChange={handleFileChange}
              multiple
              className='hidden'
            />
          </div>

          <Button
            onClick={handleSendMessage}
            variant='ghost'
            size='icon'
            disabled={!message.trim() && pendingFiles.length === 0}
            className='text-foreground/80 hover:text-foreground/70 transition-colors size-10 rounded-3xl'
          >
            <SendHorizonal className='size-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
