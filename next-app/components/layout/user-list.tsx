import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';

import { cn } from '@/lib/utils';
import StatusIndicator from '../custom ui/status-indicator';
import TypingIndicator from '../custom ui/typing-indicator';

export default function UserList() {
  const { users, typingUsers, connection } = useChat();
  const { userId } = useAuth();

  const sortedUsers = [...users].sort((a, b) => {
    // Sort by current user first
    if (a.id === userId) return -1;
    if (b.id === userId) return 1;
    // Sort by online status
    if (a.isOnline !== b.isOnline) {
      return a.isOnline ? -1 : 1;
    }
    // Sort by username
    return a.username.localeCompare(b.username);
  });

  return (
    <div className='space-y-4'>
      {sortedUsers.map((user) => {
        const isTyping = typingUsers.some(
          (typingUser) => typingUser.id === user.id
        );
        return (
          <div
            key={user.id}
            className={cn('flex items-center gap-2 rounded-md', {
              'text-muted-foreground': user.id === userId || !user.isOnline,
            })}
          >
            <StatusIndicator
              isOnline={connection.isConnected ? user.isOnline : false}
            />
            <span className='truncate text-sm'>
              {user.username} {user.id === userId && '(you)'}
            </span>
            <span className='ml-auto'>{isTyping && <TypingIndicator />}</span>
          </div>
        );
      })}
    </div>
  );
}
