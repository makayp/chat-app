'use client';

import { useChatRooms } from '@/contexts/chat-room-context';
import clsx from 'clsx';
import { Paperclip, SendHorizonalIcon, SendIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import SiteHeader from './site-header';

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { getChatRoom } = useChatRooms();
  const room = getChatRoom(roomId);

  if (!room) {
    return <div>Room not found</div>;
  }

  const { messages } = room;

  return (
    <div className='flex flex-col h-full'>
      <SiteHeader room={room} />

      <div className='px-4 md:px-8 grow py-10 flex flex-col'>
        <p className='text-foreground/70 text-sm text-center font-semibold mb-8'>
          👋🏼 Welcome to the chat
        </p>

        {messages.map((message, index) => {
          const isPreviousMessageSameSender =
            index > 0 && messages[index - 1].sender === message.sender;

          return (
            <div
              key={index + message.id}
              className={clsx('flex flex-col w-full gap-1 pt-1', {
                'self-end items-end': message.sender === 'me',
                'pt-7': !isPreviousMessageSameSender,
              })}
            >
              <p className='text-xs text-muted-foreground font-semibold w-fit'>
                {isPreviousMessageSameSender
                  ? ''
                  : message.sender === 'me'
                  ? 'You'
                  : message.sender}
              </p>
              <div
                className={clsx('flex items-center gap-2 w-full', {
                  'flex-row-reverse': message.sender === 'me',
                })}
              >
                <div
                  className={clsx(
                    'relative rounded-2xl px-3 py-2 font-medium text-foreground whitespace-pre-wrap text-[0.95rem] w-fit max-w-9/10 sm:max-w-7/10',
                    {
                      'rounded-tr-none bg-violet-600': message.sender === 'me',
                      'rounded-tl-none bg-foreground/10 border border-sidebar-border':
                        message.sender !== 'me',
                    }
                  )}
                >
                  {message.content}

                  {/* <p
                  className={clsx(
                    'text-[0.6rem] bottom-0.5 -mb-1 text-muted-foreground font-semibold w-fit tracking-tighter whitespace-nowrap ml-auto',
                    {
                      'text-white/80': message.sender === 'me',
                    }
                  )}
                >
                  {formatTimeAgo(message.timestamp)}
                </p> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='backdrop-blur sticky bottom-0 mx-auto w-full px-2 md:px-8 pt-1 pb-4 md:pb-8 shadow-'>
        <div className='flex flex-none items-center gap-4'>
          <Paperclip className='size-5 text-primary/60' />
          <Textarea
            placeholder='Type a message...'
            className='flex-1 rounded-3xl ring ring-ring min-h-auto resize-none'
          />
          <Button
            asChild
            variant='ghost'
            className='px-0 py-0 rounded-md text-primary/60'
          >
            <SendHorizonalIcon className='size-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
