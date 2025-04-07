import { useChatContext } from '@/context/chat-context';
import { useWebSocket } from '@/context/web-socket-context';

export function useChat() {
  const { state } = useChatContext();

  // Initialize WebSocket connection and get methods
  const { connect, disconnect, joinRoom, createRoom } = useWebSocket();

  return {
    // State
    activeRoomId: state.activeRoomId,
    rooms: state.rooms,
    messages: state.messages,
    users: state.users,
    connection: { ...state.connection, connect, disconnect },

    // Methods
    connect,
    disconnect,
    createRoom,
    joinRoom,
  };
}
