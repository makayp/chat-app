import { createContext, useContext, useState } from 'react';

const newContext = createContext();

function NewProvider({ children }) {
  const [user, setUser] = useState('');

  return (
    <newContext.Provider value={{ user, setUser }}>
      {children}
    </newContext.Provider>
  );
}

export function useNewContext() {
  const context = useContext(newContext);
  return context;
}

export default NewProvider;
