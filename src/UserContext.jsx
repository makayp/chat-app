import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useNewContext } from '../newContext';

const userContext = createContext();

function UserProvider({ children }) {
  const { user, setUser } = useNewContext();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState();

  const initialize = useCallback(
    function () {
      const server = io(import.meta.env.VITE_SERVER_URL, {
        auth: {
          user,
        },
      });

      server.on('welcome', (data) => {
        console.log(data);
        user !== data &&
          toast(
            <span>
              <b>{data}</b> joined the chat!
            </span>
          );
      });

      server.on('messages', (data) => {
        setMessages(data);
      });

      server.on('leave-chat', (data) => {
        console.log(data);
        user !== data &&
          toast(
            <span>
              <b>{data}</b> left the chat
            </span>
          );
      });
      setSocket(server);
    },
    [user]
  );

  function sendMessage(message) {
    const newMessage = {
      id: Date.now(),
      sender: user,
      message,
      time: new Date().toISOString(),
    };
    socket.emit('message', newMessage);

    setMessages((prev) => [...prev, newMessage]);
    console.log(socket);
  }

  function leaveChat() {
    socket.disconnect();
    setUser('');
  }

  useEffect(
    function () {
      if (!messages.length && user) {
        initialize();
      }
    },
    [initialize, messages.length, user]
  );

  const scrollRef = useRef();
  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  useEffect(
    function () {
      scrollToBottom();
    },
    [user, messages]
  );

  return (
    <userContext.Provider
      value={{
        user,
        messages,
        sendMessage,
        scrollRef,
        scrollToBottom,
        leaveChat,
      }}
    >
      {children}
    </userContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(userContext);

  return context;
}

export default UserProvider;
