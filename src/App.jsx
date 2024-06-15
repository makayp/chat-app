import { useState } from 'react';
import Message from './Message';
import UserProvider from './UserContext';
import { useNewContext } from '../newContext';

function App() {
  const { user, setUser } = useNewContext();
  const [name, setName] = useState('');

  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || name?.trim().length === 0) {
      setError('Field cannot be empty!');
      return;
    }
    setUser(name);
    setName('');
  }

  return (
    <div className='app'>
      <div className='container'>
        {!user ? (
          <>
            <h1>Enter your name</h1>
            <form onSubmit={handleSubmit}>
              <input
                type='text'
                placeholder='Name'
                value={name}
                autoFocus
                onChange={(e) => {
                  setError(null);
                  setName(e.target.value);
                }}
              />
              {error && <p className='error-message'>{error}</p>}
              <button className='btn'>Enter chat</button>
            </form>
          </>
        ) : (
          user && (
            <UserProvider>
              <Message />
            </UserProvider>
          )
        )}
      </div>
    </div>
  );
}

export default App;
