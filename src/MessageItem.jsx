import { useUserContext } from './UserContext';

function MessageItem({ message }) {
  const { currentUser } = useUserContext();

  const { sender, timeAgo, ...data } = message;
  const yourMessage = sender === currentUser;

  return (
    <li
      className={`message ${yourMessage ? `message-user` : 'message-others'}`}
    >
      <div className=''>
        <div>
          <span className='message-name'>{yourMessage ? 'You' : sender}</span>
          <p className='message-text'>{data.message}</p>
        </div>
        <span className='message-time'>{timeAgo}</span>
      </div>
    </li>
  );
}

export default MessageItem;
