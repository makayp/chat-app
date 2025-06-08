'use client';

import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';
import { ClientConstants } from '@/lib/constants.client';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatHeader from './chat-header';
import MessageInput from './message/message-input';
import MessageList from './message/message-list';

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { userId } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const router = useRouter();

  const {
    rooms,
    connection,
    activeRoomId,
    users,
    messages,
    typingUsers,
    addPendingFile,
    setActiveRoomId,
  } = useChat();

  const { isInitialConnect, isConnecting, isConnected } = connection;
  const isInitialLoad = useRef(true);

  useEffect(() => {
    return () => {
      setActiveRoomId(null);
    };
  }, [setActiveRoomId]);

  useEffect(() => {
    if (isInitialConnect) return;

    const isInRoom = rooms.some((room) => room.id === roomId);

    if (!isInRoom) {
      if (!isInitialLoad.current) router.push('/');
      else router.push(`/?roomId=${roomId}`);
      return;
    }

    if (activeRoomId !== roomId) {
      setActiveRoomId(roomId);
      isInitialLoad.current = false;
    }
  }, [activeRoomId, isInitialConnect, roomId, rooms, router, setActiveRoomId]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } = ClientConstants;

    // Process dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        // Check if the file type is allowed;
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          toast.error('Only PNG, JPEG, and PDF files are allowed.');
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error('File size exceeds the limit of 5MB.');
          return;
        }

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
      {isInitialConnect && isConnecting && (
        <div className='flex-1 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
        </div>
      )}

      {isInitialConnect && !isConnecting && !isConnected && (
        <div className='flex-1 flex items-center justify-center text-center text-muted-foreground'>
          Failed to connect to the server. <br /> Please try again later
        </div>
      )}

      {!isInitialConnect && activeRoomId && (
        <>
          <MessageList
            users={users}
            messages={messages}
            typingUsers={typingUsers}
            currentUserId={userId!}
          />
          <MessageInput />
        </>
      )}

      {isDragging && (
        <div className='absolute inset-0 flex flex-col text-lg items-center justify-center gap-2 bg-background/90 text-foreground rounded-md z-50 border border-dashed border-primary/70'>
          <Upload className='size-8' />
          Drop files here to add them to the chat
        </div>
      )}
    </div>
  );
}
