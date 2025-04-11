'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';

import { clientConfig } from '@/lib/constants.client';
import { useAuth } from './auth-context';
import toast from 'react-hot-toast';
import { useChatContext } from './chat-context';
import { ChatRoom } from '@/types';

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
    }
  | undefined
>(undefined);

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setSession } = useAuth();
  const { dispatch } = useChatContext();
  const ws = useRef<Socket | null>(null);

  const socket = ws.current;

  const url = clientConfig.wsUrl;

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
          isInitialConnect: false,
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

    ws.current.on('session', async ({ sessionId, userId, username }) => {
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

  const value = {
    connect,
    disconnect,
    createRoom,
    joinRoom,
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
