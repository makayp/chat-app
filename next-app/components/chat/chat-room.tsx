'use client';

import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatHeader from './chat-header';
import MessageInput from './message/message-input';
import MessageList from './message/message-list';

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { userId, username } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const router = useRouter();

  const {
    rooms,
    connection,
    activeRoomId,
    messages,
    typingUsers,
    addPendingFile,
    setActiveRoomId,
    joinRoom,
  } = useChat();

  const { isConnected, isInitialConnect, isConnecting } = connection;

  useEffect(() => {
    if (username && roomId) {
      const isInRoom = rooms.some((room) => room.id === roomId);

      if (!isInRoom) {
        if (!isConnected) {
          console.error('Not connected to the server');
          router.push('/');
          return;
        }

        joinRoom(roomId).catch((error) => {
          console.error('Failed to join room:', error);
          router.push('/');
        });
      }

      // Set as active room
      if (activeRoomId !== roomId) {
        setActiveRoomId(roomId);
      }
    }
  }, [
    isConnected,
    username,
    roomId,
    rooms,
    joinRoom,
    activeRoomId,
    setActiveRoomId,
    router,
  ]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // Process dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        addPendingFile(file);
      });
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn('h-full flex flex-col overflow-y-auto')}
    >
      <ChatHeader />
      {/* {isInitialConnect && isConnecting && (
        <div className='flex-1 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      )} */}

      <MessageList
        messages={messages}
        typingUsers={typingUsers}
        currentUserId={userId!}
      />

      <MessageInput />

      {isDragging && (
        <div className='absolute inset-0 flex flex-col text-lg items-center justify-center gap-2 bg-background/90 text-foreground rounded-md z-50 border border-dashed border-primary/70'>
          <Upload className='size-8' />
          Drop files here to add them to the chat
        </div>
      )}
    </div>
  );
}
