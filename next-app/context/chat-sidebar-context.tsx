'use client';

import { createContext, useContext, useState } from 'react';

interface ChatSidebarContextType {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  toggleSidebar: () => void;
}

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(
  undefined
);

export default function ChatSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(false);
  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };
  return (
    <ChatSidebarContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error(
      'useChatSidebarContext must be used within a ChatSidebarProvider'
    );
  }
  return context;
}
