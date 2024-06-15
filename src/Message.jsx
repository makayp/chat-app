import { useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import { TiMessages } from 'react-icons/ti';
import MessageItem from './MessageItem';
import { useUserContext } from './UserContext';
import { IoExitOutline } from 'react-icons/io5';
import { useNewContext } from '../newContext';

function Message() {
  const { messages, sendMessage, scrollRef, leaveChat } = useUserContext();

  const { setUser } = useNewContext();

  const [text, setText] = useState('');

  const filteredMessages = messages?.sort((a, b) => a.id - b.id);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text || text?.trim().length === 0) {
      return;
    }
    sendMessage(text);
    setText('');
  }

  function handleLeaveChat() {
    leaveChat();
    // setUser('');
  }

  return (
    <div className='chat-room'>
      <header>
        <h1>
          <TiMessages /> <span>Chat room</span>
        </h1>
        <span className='exit-btn' onClick={handleLeaveChat}>
          <IoExitOutline />
        </span>
      </header>

      <ul className='messages' ref={scrollRef}>
        {filteredMessages?.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
        <span id='scroll' className='scrollTo'></span>
      </ul>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Type message'
            value={text}
            onChange={(e) => setText(e.target.value)}
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
