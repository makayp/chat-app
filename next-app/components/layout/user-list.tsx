import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';

import clsx from 'clsx';
import StatusIndicator from '../custom ui/status-indicator';
import TypingIndicator from '../custom ui/typing-indicator';

export default function UserList() {
  const { users, typingUsers } = useChat();
  const { userId } = useAuth();

  const sortedUsers = [...users].sort((a, b) => {
    // Sort by online status first, then by name
    if (a.isOnline !== b.isOnline) {
      return a.isOnline ? -1 : 1;
    }
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
            className={clsx('flex items-center gap-2 rounded-md', {
              'text-sidebar-primary': user.id === userId,
            })}
          >
            <StatusIndicator isOnline={user.isOnline} />
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
