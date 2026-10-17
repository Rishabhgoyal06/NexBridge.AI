import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalChatWidget } from '@/components/chat/GlobalChatWidget';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="pl-[232px] flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="pt-14 flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>

      {/* Global Context-Aware AI Chat */}
      <GlobalChatWidget />
    </div>
  );
};
