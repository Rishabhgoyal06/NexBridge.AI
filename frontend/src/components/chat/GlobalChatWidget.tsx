import React, { useState, useEffect, useRef } from 'react';
import { useGlobalPageContext } from '@/context/PageContext';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chatService';
import { ChatMessage } from '@/types';

export const GlobalChatWidget: React.FC = () => {
  const { context, isChatOpen, setIsChatOpen, toggleChat } = useGlobalPageContext();
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Founder';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_initial',
      sender: 'assistant',
      content: `Hello ${displayName}! I'm your NexBridge AI venture copilot. I am currently synchronizing with this page: **${context.title}**. Ask me to analyze risks, review competitor moats, evaluate candidate matches, or draft strategic next steps.`,
      timestamp: 'Now',
      quickActions: ['Review Skeptic pushback', 'Check unit economics', 'Match candidates'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesFeedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isChatOpen) return;
    const container = messagesFeedRef.current;
    if (!container) return;

    const timeoutId = setTimeout(() => {
      if (!container) return;
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg) return;

      if (lastMsg.sender === 'assistant') {
        const lastEl = document.getElementById(`copilot-msg-${lastMsg.id}`);
        if (lastEl) {
          const containerRect = container.getBoundingClientRect();
          const elRect = lastEl.getBoundingClientRect();
          const targetTop = elRect.top - containerRect.top + container.scrollTop;
          container.scrollTo({
            top: Math.max(0, targetTop - 8),
            behavior: 'smooth',
          });
          return;
        }
      }

      // If user message or typing indicator, scroll container to bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [messages, isSending, isChatOpen]);

  // Keyboard shortcut ⌘J / Ctrl+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await chatService.sendMessage({
        message: text,
        context,
        history: [...messages, userMessage],
      });
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: 'Sorry, I encountered an issue synchronizing with the AI agents. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="global-chat-trigger"
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 h-12 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary shadow-lg hover:shadow-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2"
        title="Ask NexBridge Copilot (⌘J)"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
            neurology
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-fixed rounded-full animate-ping"></span>
        </div>
        <span className="font-label-md text-label-md font-medium tracking-tight pr-1">
          {isChatOpen ? 'Close Copilot' : 'Ask Copilot'}
        </span>
        <kbd className="hidden sm:inline-block font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-on-primary/80 font-mono">
          ⌘J
        </kbd>
      </button>

      {/* Floating Chat Modal / Panel */}
      {isChatOpen && (
        <div
          id="global-chat-panel"
          className="fixed bottom-20 right-6 z-50 w-[410px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-7rem)] bg-surface-container-lowest rounded-2xl shadow-2xl border-2 border-outline-variant/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-[14px] font-semibold text-on-surface truncate">
                    NexBridge Copilot
                  </span>
                  <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-primary-fixed/40 text-primary-container font-semibold uppercase border border-primary-container/20">
                    LIVE
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-secondary truncate">
                  Context: {context.title}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-surface-container-low/80 border-b border-outline-variant/25 flex items-center gap-2 text-[11px] font-body-sm text-secondary">
            <span className="material-symbols-outlined text-[14px] text-primary-container shrink-0">
              radar
            </span>
            <span className="truncate">
              Synchronized with: <strong className="text-on-surface">{context.summary}</strong>
            </span>
          </div>

          {/* Messages Feed */}
          <div ref={messagesFeedRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                id={`copilot-msg-${msg.id}`}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-primary-container text-on-primary rounded-br-none'
                      : 'bg-surface-container-low text-on-surface rounded-bl-none border border-outline-variant/35'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex flex-wrap gap-1.5">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(qa)}
                          className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container text-primary-container border border-outline-variant/40 transition-colors shadow-2xs font-medium cursor-pointer"
                        >
                          {qa}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-secondary mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-secondary font-body-sm text-xs p-2">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                <span>Copilot is synthesizing page telemetry...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about this page or idea..."
              className="flex-1 px-3 py-2 bg-surface-container-low rounded-xl text-body-sm font-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/40 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="w-9 h-9 rounded-xl bg-primary-container hover:bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
