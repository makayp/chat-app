import { useEffect, useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import { TiMessages } from 'react-icons/ti';
import MessageItem from './MessageItem';
import { useUserContext } from './UserContext';
import { IoExitOutline } from 'react-icons/io5';
import { FaAnglesDown } from 'react-icons/fa6';
import { formatDistanceToNow } from 'date-fns';

function Message() {
  const {
    messages,
    sendMessage,
    scrollRef,
    messageBoxRef,
    leaveChat,
    whoIsTyping,
    typeMessage,
    debounceTypeMessage,
    scrollToBottom,
    newMessages,
  } = useUserContext();
  const [formattedMessages, setFormattedMessages] = useState([]);

  const [text, setText] = useState('');
  const [hasTyped, setHasTyped] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text || text?.trim().length === 0) {
      return;
    }
    sendMessage(text);
    setText('');
    scrollToBottom();
  }

  function handleChange(e) {
    setText(e.target.value);

    if (!hasTyped) {
      typeMessage();
      setHasTyped(true);
    } else {
      debounceTypeMessage();
    }
  }

  useEffect(() => {
    // Function to format the time
    const formatMessageTimes = () => {
      const updatedMessages = messages.map((message) => ({
        ...message,
        timeAgo: formatDistanceToNow(new Date(message.time), {
          addSuffix: true,
        }),
      }));
      setFormattedMessages(updatedMessages);
    };

    formatMessageTimes();

    const intervalId = setInterval(() => {
      formatMessageTimes();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [messages]);

  return (
    <div className='chat-room'>
      <header>
        <h1>
          <TiMessages /> <span>Chat room</span>
        </h1>
        <span className='exit-btn' onClick={leaveChat}>
          <IoExitOutline />
        </span>
      </header>

      <ul className='messages' ref={messageBoxRef}>
        {formattedMessages?.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
        <div id='scroll' ref={scrollRef}></div>
      </ul>
      <div className='form-container'>
        {newMessages.length > 0 && (
          <span className='scroll-message' onClick={scrollToBottom}>
            <span>{newMessages.length}</span>
            <span>
              <FaAnglesDown />
            </span>
          </span>
        )}
        {whoIsTyping && <p className='typing'>{whoIsTyping} is typing...</p>}
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Enter a message'
            value={text}
            onChange={handleChange}
          />
          <button>
            <IoMdSend />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Message;
