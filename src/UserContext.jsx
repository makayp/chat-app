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
import { useDebouncedCallback } from 'use-debounce';

const userContext = createContext();

function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [whoIsTyping, setWhoIsTyping] = useState(null);

  const [newMessages, setNewMessages] = useState([]);

  const [isAtBottom, setIsAtBottom] = useState(false);

  const typingTimeoutRef = useRef();
  const messageBoxRef = useRef();

  const initialize = useCallback(
    function () {
      const server = io(import.meta.env.VITE_SERVER_URL, {
        auth: {
          currentUser,
        },
      });

      server.on('join', (user) => {
        currentUser !== user &&
          toast(
            <span>
              <b>{user}</b> joined the chat! 👋🏼
            </span>
          );
      });

      server.on('welcome', (messages) => {
        setMessages(messages);
        scrollToBottom();
      });

      server.on('clear messages', (messages) => {
        setMessages(messages);
      });

      server.on('typing', (user) => {
        setWhoIsTyping(user);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
          setWhoIsTyping(null);
        }, 2000);
      });

      server.on('message', (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        setWhoIsTyping(null);

        const isBottom = checkIfAtBottom();

        if (isBottom) {
          scrollToBottom();
        } else {
          setNewMessages((curr) => [...curr, newMessage]);
        }
      });

      server.on('leave-chat', (username) => {
        toast(
          <span>
            <b>{username}</b> left the chat 🚶🏻‍♂️‍➡️
          </span>
        );
      });
      setSocket(server);
    },
    [currentUser]
  );

  function typeMessage() {
    socket.emit('typing', currentUser);
  }

  const debounceTypeMessage = useDebouncedCallback(() => {
    socket.emit('typing', currentUser);
  }, 200);

  function sendMessage(message) {
    const newMessage = {
      id: Date.now(),
      sender: currentUser,
      message,
      time: new Date().toISOString(),
    };
    socket.emit('message', newMessage);

    setMessages((prev) => [...prev, newMessage]);
  }

  function leaveChat() {
    socket.disconnect();
    setSocket(null);
    setCurrentUser('');
    setMessages([]);
  }

  useEffect(
    function () {
      if (isAtBottom) setNewMessages([]);
    },
    [isAtBottom]
  );

  useEffect(
    function () {
      if (!currentUser) return;

      if (!socket) {
        initialize();
      } else {
        socket.connect();
      }
    },
    [initialize, currentUser, socket]
  );

  const scrollRef = useRef();
  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    setTimeout(
      () => scrollRef.current.scrollIntoView({ behavior: 'smooth' }),
      10
    );
  };

  // Function to check if the user is at the bottom
  const checkIfAtBottom = () => {
    const container = messageBoxRef.current;

    const isBottom =
      container.scrollHeight - container.scrollTop === container.clientHeight;

    setIsAtBottom(() => isBottom);
    return isBottom;
  };

  useEffect(() => {
    const container = messageBoxRef.current;

    container?.addEventListener('scroll', checkIfAtBottom);

    return () => {
      container?.removeEventListener('scroll', checkIfAtBottom);
    };
  }, [messageBoxRef.current]);

  return (
    <userContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        messages,
        sendMessage,
        scrollRef,
        messageBoxRef,
        scrollToBottom,
        leaveChat,
        whoIsTyping,
        typeMessage,
        debounceTypeMessage,
        newMessages,
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
