import { useUserContext } from './UserContext';
import { calcTimeSent } from './helpers';

function MessageItem({ message }) {
  const { user } = useUserContext();

  const { sender, time, ...data } = message;
  const yourMessage = sender === user;

  return (
    <li
      className={`message ${yourMessage ? `message-user` : 'message-others'}`}
    >
      <div className=''>
        <div>
          <span className='message-name'>{yourMessage ? 'You' : sender}</span>
          <p className='message-text'>{data.message}</p>
        </div>
        <span className='message-time'>{calcTimeSent(time)}</span>
      </div>
    </li>
  );
}

export default MessageItem;
