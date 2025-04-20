'use client';
import { clientConfig } from '@/lib/constants.client';
import { ConnectionState } from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

const WebSocketContext = createContext<
  | {
      socket: Socket | null;
      connect: () => void;
      disconnect: () => void;
      connectionState: ConnectionState;
      setConnectionState: React.Dispatch<React.SetStateAction<ConnectionState>>;
    }
  | undefined
>(undefined);

const initialConnectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  isInitialConnect: true,
  willReconnect: false,
  error: null,
};

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    initialConnectionState
  );

  const { setSession } = useAuth();
  const ws = useRef<Socket | null>(null);

  const socket = ws.current;

  const url = clientConfig.wsUrl;

  const init = useCallback(() => {
    const savedSession = localStorage.getItem('session');
    if (!savedSession) return;
    const { sessionId, username } = JSON.parse(savedSession);
    if ((!username && !sessionId) || !url || ws.current) return;

    // Set connection state
    setConnectionState((prev) => ({
      ...prev,
      isConnecting: true,
      isInitialConnect: true,
      error: null,
    }));

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
    ws.current.io.on('reconnect_attempt', () => {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: true,
        isConnected: false,
      }));
    });

    ws.current.io.on('reconnect_failed', () => {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        willReconnect: false,
        error: 'Reconnection failed',
      }));
    });

    // Connection opened
    ws.current.on('connect', () => {
      console.log('WebSocket connection established');
      setConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        willReconnect: false,
        error: null,
      }));
    });

    // Connection closed
    ws.current.on('disconnect', () => {
      console.log('WebSocket connection closed');

      if (ws.current?.active) {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          willReconnect: true,
          error: 'Connection lost',
        }));
      } else {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          willReconnect: false,
          error: 'Connection closed',
        }));
      }
    });

    // Connection error
    ws.current.on('connect_error', () => {
      if (ws.current?.active) {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          willReconnect: true,
          error: 'Connection error',
        }));
      } else {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          willReconnect: false,
          error: 'Connection error',
        }));
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
  }, [url, setSession]);

  // Connect to WebSocket
  useEffect(() => {
    if (!url || socket?.connected) return;

    if (!socket) {
      init();
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
      init();
      return;
    }
    if (socket.disconnected) {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: true,
        isConnected: false,
        willReconnect: false,
        error: null,
      }));
      socket.connect();
    }
  }, [socket, init]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (!socket) return;
    socket.disconnect();
    setConnectionState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: 'Disconnected',
    }));
  }, [socket]);

  const value = {
    socket,
    connect,
    disconnect,
    connectionState,
    setConnectionState,
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
