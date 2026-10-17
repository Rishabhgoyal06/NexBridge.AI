import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageContextType } from '@/types';

interface PageContextContextType {
  context: PageContextType;
  setPageContext: (ctx: PageContextType) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const defaultContext: PageContextType = {
  pageKey: 'landing',
  title: 'NexBridge.ai Venture Studio',
  summary: 'Platform landing page and venture acceleration entry',
};

const PageContextContext = createContext<PageContextContextType | undefined>(undefined);

export const PageContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<PageContextType>(defaultContext);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  return (
    <PageContextContext.Provider
      value={{
        context,
        setPageContext: setContext,
        isChatOpen,
        setIsChatOpen,
        toggleChat,
      }}
    >
      {children}
    </PageContextContext.Provider>
  );
};

export const useGlobalPageContext = () => {
  const ctx = useContext(PageContextContext);
  if (!ctx) {
    throw new Error('useGlobalPageContext must be used within a PageContextProvider');
  }
  return ctx;
};

/**
 * Hook to be called by every screen/page to bind current route, title, summary, and data
 */
export function usePageContext(pageData: PageContextType) {
  const { setPageContext } = useGlobalPageContext();

  useEffect(() => {
    setPageContext(pageData);
  }, [pageData.pageKey, pageData.title, pageData.summary, JSON.stringify(pageData.data)]);
}
