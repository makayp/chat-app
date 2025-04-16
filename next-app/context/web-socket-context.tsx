'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';

// import { clientConfig } from '@/lib/constants.client';
import { useAuth } from './auth-context';
import toast from 'react-hot-toast';
import { useChatContext } from './chat-context';
import { ChatRoom, Message } from '@/types';
import { clientConfig } from '@/lib/constants.client';

interface ServerError {
  type: string;
  message: string;
}

const WebSocketContext = createContext<
  | {
      connect: () => void;
      disconnect: () => void;
      createRoom: (
        roomName: string,
        password?: string
      ) => Promise<ChatRoom | undefined>;
      joinRoom: (roomId: string, password?: string) => Promise<void>;
      sendMessage: (content: string) => void;
      markMessageAsRead: (roomId: string, messageId: string) => void;
    }
  | undefined
>(undefined);

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, setSession } = useAuth();
  const { dispatch, state } = useChatContext();
  const ws = useRef<Socket | null>(null);

  const socket = ws.current;

  const url = clientConfig.wsUrl;
  // const url = null;

  const init = useCallback(() => {
    const savedSession = localStorage.getItem('session');
    if (!savedSession) return;
    const { sessionId, username } = JSON.parse(savedSession);
    if ((!username && !sessionId) || !url || ws.current) return;

    dispatch({
      type: 'SET_CONNECTION_STATUS',
      payload: { isConnecting: true, isInitialConnect: true, error: null },
    });

    // Create new WebSocket connection
    ws.current = io(url, {
      auth: {
        sessionId: sessionId,
        username,
      },
      autoConnect: false,
      reconnectionAttempts: 5,
    });

    // Socket Manager Events
    ws.current.io.on('reconnect_attempt', (attempt) => {
      console.error(`manager:reconnect_attempt ${attempt}`);
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isConnecting: true,
          isConnected: false,
        },
      });
    });

    ws.current.io.on('reconnect_failed', () => {
      console.error(`manager:reconnect_failed`);
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isConnecting: false,
          isConnected: false,
          willReconnect: false,
          error: 'Reconnection failed',
        },
      });
    });

    // Connection opened
    ws.current.on('connect', () => {
      console.log('WebSocket connection established');
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isConnected: true,
          isConnecting: false,
          willReconnect: false,
          error: null,
        },
      });
    });

    // Connection closed
    ws.current.on('disconnect', () => {
      console.log('WebSocket connection closed');

      if (ws.current?.active) {
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: {
            isConnected: false,
            willReconnect: true,
            error: 'Connection lost',
          },
        });
      } else {
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: {
            isConnected: false,
            isConnecting: false,
            willReconnect: false,
            error: 'Connection closed',
          },
        });
      }
    });

    // Connection error
    ws.current.on('connect_error', (error) => {
      if (ws.current?.active) {
        console.log('WebSocket connection error:', error);
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: {
            isConnected: false,
            willReconnect: true,
            error: 'Connection error',
          },
        });
      } else {
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: {
            isConnected: false,
            isConnecting: false,
            willReconnect: false,
            error: 'Connection error',
          },
        });
      }
    });

    ws.current.on('session', ({ sessionId, userId, username }) => {
      if (!ws.current) return;
      ws.current.auth = {
        sessionId,
        username,
      };
      setSession({
        sessionId,
        userId,
        username,
      });
    });

    ws.current.on('rooms', (data) => {
      console.log('User rooms:', data);
      dispatch({ type: 'SET_ROOMS', payload: data.joinedRooms });
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isInitialConnect: false,
        },
      });

      for (const room of data.joinedRooms as ChatRoom[]) {
        const messages = room.messages || [];
        const roomId = room.id;

        // Mark messages as delivered
        messages.forEach((message) => {
          console.log('userId:', userId);
          if (message.from !== userId && message.status === 'sent') {
            ws.current?.emit('message_delivered', {
              roomId,
              messageId: message.id,
            });
          }
        });
      }
    });

    ws.current.on('new_message', (data) => {
      console.log('New message:', data);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { ...data.message, status: 'delivered' },
      });
      console.log(ws.current);

      // Mark message as delivered
      if (data.message.from !== userId) {
        ws.current?.emit('message_delivered', {
          roomId: data.message.to,
          messageId: data.message.id,
        });
      }
    });

    ws.current.on('message_status', (data) => {
      console.log('Message status:', data.status);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          roomId: data.roomId,
          messageId: data.messageId,
          updates: { status: data.status },
        },
      });
    });

    ws.current.on('user_joined', (data) => {
      console.log('User joined:', data);
      dispatch({
        type: 'ADD_USER',
        payload: { roomId: data.roomId, user: data.user },
      });
    });
    ws.current.on('user_left', (data) => {
      console.log('User left:', data);
      dispatch({
        type: 'REMOVE_USER',
        payload: { roomId: data.roomId, userId: data.userId },
      });
    });
    ws.current.on('user_status', (data) => {
      console.log('User status:', data);
      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: {
          userId: data.userId,
          status: data.status,
        },
      });
    });
  }, [url, dispatch, setSession]);

  // Connect to WebSocket
  useEffect(() => {
    if (!url) return;

    if (!socket) {
      init();
      return;
    }

    if (socket.connected) {
      console.log('WebSocket already connected');
      return;
    }

    socket.connect();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [url, socket, init]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!socket) {
      toast.error('No WebSocket connection available');
      init();
      return;
    }
    if (socket.disconnected) {
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isConnecting: true,
          isConnected: false,
          willReconnect: false,
          error: null,
        },
      });
      socket.connect();
    }
  }, [socket, init, dispatch]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (!socket) return;
    socket.disconnect();
    dispatch({
      type: 'SET_CONNECTION_STATUS',
      payload: {
        isConnected: false,
        isConnecting: false,
        willReconnect: false,
        error: 'Disconnected',
      },
    });
  }, [socket, dispatch]);

  // Create a new room
  const createRoom = useCallback(
    async (
      roomName: string,
      password?: string
    ): Promise<ChatRoom | undefined> => {
      if (!socket || !socket.connected) {
        throw new Error('Not connected to server');
      }
      return new Promise((resolve, reject) => {
        socket.emit(
          'create_room',
          { roomName, password },
          (response: { room: ChatRoom }) => {
            if (response.room) {
              dispatch({ type: 'JOIN_ROOM', payload: response.room });

              return resolve(response.room);
            } else {
              reject(new Error('Failed to create room'));
            }
          }
        );
      });
    },
    [socket, dispatch]
  );

  // Join a room
  const joinRoom = useCallback(
    async (roomId: string, password?: string): Promise<void> => {
      if (!socket || !socket.connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'join_room',
          { roomId, password },
          (response: { error?: ServerError; room?: ChatRoom }) => {
            if (response.error) {
              reject(new Error(response.error.message));
            } else if (response.room) {
              dispatch({ type: 'JOIN_ROOM', payload: response.room });
              resolve();
            }
          }
        );
      });
    },
    [dispatch, socket]
  );

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!state.activeRoomId) {
        toast.error('No active room');
        return;
      }

      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      console.log('Sending message:', content);

      const roomId = state.activeRoomId;

      const tempId = Date.now().toString();

      // Process files if any
      const fileData = state.pendingFiles[roomId]?.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      }));

      console.log('Pending files:', fileData);

      // Create message object
      const message: Message = {
        id: tempId,
        to: roomId,
        content,
        from: userId,
        timestamp: Date.now(),
        status: 'sending',
        files: fileData,
        role: 'user',
      };

      // Dispatch message to chat context
      dispatch({
        type: 'ADD_MESSAGE',
        payload: message,
      });
      // Clear pending files
      dispatch({
        type: 'CLEAR_PENDING_FILES',
      });

      if (!socket || !socket.connected) {
        toast.error('Not connected to server');
        return;
      }

      // Emit message to server
      socket.emit('send_message', message, (message: Message) => {
        if (message && message.id !== tempId) {
          // Update temporary message with the server response
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { roomId, messageId: tempId, updates: message },
          });
        }
      });
    },
    [socket, state.activeRoomId, userId, dispatch, state.pendingFiles]
  );

  // Mark messages as read
  const markMessageAsRead = useCallback(
    (roomId: string, messageId: string) => {
      if (!socket || !socket.connected) {
        toast.error('Not connected to server');
        return;
      }
      socket.emit(
        'message_read',
        { roomId, messageId },
        (response: { success: boolean }) => {
          if (response.success) {
            console.log('Message marked as read:', response);
          } else {
            console.error('Failed to mark message as read:', response);
          }
        }
      );
      // Dispatch to chat context
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          roomId,
          messageId,
          updates: { status: 'read' },
        },
      });
    },
    [dispatch, socket]
  );

  const value = {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    sendMessage,
    markMessageAsRead,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
