import React, { useState, useEffect, useRef } from 'react';
import { ValidationAgent, AgentDiscussionMessage } from '@/types';
import { ideaService } from '@/services/ideaService';

interface AgentDiscussionThreadProps {
  agent: ValidationAgent;
  ideaId: string;
  ideaTitle?: string;
  category?: string;
  initialSubParameter?: string;
  existingMessages?: AgentDiscussionMessage[];
  onClose?: () => void;
}

export const AgentDiscussionThread: React.FC<AgentDiscussionThreadProps> = ({
  agent,
  ideaId,
  ideaTitle = 'Active Concept',
  category = 'Technology',
  initialSubParameter,
  existingMessages = [],
  onClose,
}) => {
  const [messages, setMessages] = useState<AgentDiscussionMessage[]>(existingMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubParam, setSelectedSubParam] = useState<string>(
    initialSubParameter || 'General Advisory'
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesFeedRef = useRef<HTMLDivElement>(null);

  // Default suggested starters based on agent type
  const getAgentStarters = () => {
    const name = agent.name.toLowerCase();
    if (name.includes('market')) {
      return [
        'How can we test buyer willingness-to-pay before building the full product?',
        'Which beachhead customer acquisition channel will yield the lowest blended CAC?',
        'Can you break down our addressable TAM into realistic Indian metro segments?',
      ];
    }
    if (name.includes('skeptic')) {
      return [
        'How can we prevent the typical 28-day user habit decay cliff?',
        'What is the single most fatal unverified assumption in our business model?',
        'What early qualitative signals indicate we should urgently pivot?',
      ];
    }
    if (name.includes('revenue')) {
      return [
        'How can we increase our LTV:CAC ratio above 4.0x?',
        'Are our proposed pricing tiers realistic for our customer segment?',
        'How do we structure upfront annual contracts to create negative working capital?',
      ];
    }
    if (name.includes('competitor')) {
      return [
        'What stops a well-funded incumbent from cloning our core features in 3 months?',
        'How do we build high structural switching costs into the user workflow from Day 1?',
        'What is our unfair distribution advantage against legacy tools?',
      ];
    }
    // Technical Architect
    return [
      'What are our primary technical bottlenecks and latency budget risks?',
      'How much will AI model inference cost per daily active user at scale?',
      'Should we build this with microservices or a monolithic async framework?',
    ];
  };

  const subParameterOptions = [
    'General Advisory',
    'Demand & TAM',
    'Willingness to Pay',
    'Key Conviction Factors',
    'Flagged Vulnerabilities',
    'Technical Feasibility',
    'Monetization Rigor',
  ];

  // Container-scoped auto-scroll: never scrolls the outer page window
  useEffect(() => {
    const container = messagesFeedRef.current;
    if (!container || messages.length === 0) return;

    const timeoutId = setTimeout(() => {
      if (!container) return;
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg) return;

      if (lastMsg.sender !== 'user') {
        const lastEl = document.getElementById(`thread-msg-${lastMsg.id || messages.length - 1}`);
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

      // If user message or loading, scroll container to bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AgentDiscussionMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      agentName: agent.name,
      subParameter: selectedSubParam,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const reply = await ideaService.sendAgentDiscussionMessage(
        ideaId,
        agent.name,
        text,
        selectedSubParam,
        messages
      );
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error('Discussion error:', err);
      const errorMsg: AgentDiscussionMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        agentName: agent.name,
        subParameter: selectedSubParam,
        content: `I experienced a temporary network latency analyzing "${text}". Let's continue discussing your strategy for ${ideaTitle}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-surface-container-lowest flex flex-col h-[520px]">
      {/* 1. Discussion Header */}
      <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
            <span className="material-symbols-outlined text-[17px]">{agent.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-on-surface truncate">
                {agent.name} Follow-Up Discussion
              </span>
              <span className="px-2 py-0.2 rounded-full bg-primary-fixed/40 text-primary-container font-mono text-[10px] font-bold border border-primary-container/20">
                {agent.score}/100 Conviction
              </span>
            </div>
            <span className="text-[11px] text-secondary truncate block">
              {agent.roleTitle} • Discussing {ideaTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="text-secondary hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors text-xs flex items-center gap-1 font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Parameter Focus Pill Bar */}
      <div className="px-4 py-2 bg-surface-container-low/40 border-b border-outline-variant/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-outline shrink-0 tracking-wider mr-1">
          Sub-Parameter:
        </span>
        {subParameterOptions.map((param) => (
          <button
            key={param}
            onClick={() => setSelectedSubParam(param)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
              selectedSubParam === param
                ? 'bg-primary-container text-on-primary shadow-2xs'
                : 'bg-surface-container text-secondary hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            {param}
          </button>
        ))}
      </div>

      {/* 3. Messages Stream */}
      <div ref={messagesFeedRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-container-low/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[24px]">forum</span>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-on-surface">
                Start a Follow-Up Discussion with {agent.name}
              </h4>
              <p className="text-xs text-secondary mt-1 max-w-md">
                Interrogate the agent&apos;s findings, propose counter-strategies for flagged risks, or pressure-test your unit economics and market demand.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="w-full max-w-md space-y-1.5 pt-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-secondary block text-left">
                Suggested Discussion Starters:
              </span>
              {getAgentStarters().map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(starter)}
                  className="w-full text-left p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/20 hover:border-primary-container/40 text-xs text-on-surface transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="pr-2 line-clamp-1">&ldquo;{starter}&rdquo;</span>
                  <span className="material-symbols-outlined text-[14px] text-secondary group-hover:text-primary-container shrink-0">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id || index}
                id={`thread-msg-${msg.id || index}`}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-secondary px-1">
                  <span className="font-semibold">
                    {isUser ? 'You' : agent.name}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.subParameter && (
                    <>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-secondary font-mono">
                        {msg.subParameter}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-primary-container text-on-primary rounded-tr-xs shadow-xs'
                      : 'bg-surface-container-lowest text-on-surface border border-outline-variant/35 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.content}

                  {/* Conviction Score Note if provided */}
                  {msg.scoreNote && (
                    <div className="mt-2.5 pt-2 border-t border-outline-variant/25 flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      <span>{msg.scoreNote}</span>
                    </div>
                  )}
                </div>

                {/* Follow-up question chips */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[85%]">
                    {msg.suggestedFollowUps.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 hover:border-primary-container text-[11px] text-secondary hover:text-on-surface transition-colors cursor-pointer text-left flex items-center gap-1 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[12px] text-primary-container">
                          chat_bubble
                        </span>
                        <span>{chip}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[14px]">{agent.icon}</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/35 rounded-tl-xs flex items-center gap-2 text-xs text-secondary shadow-xs">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>{agent.name} is evaluating follow-up...</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Input Box */}
      <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask ${agent.name} about ${selectedSubParam}... (Press Enter)`}
            className="w-full pl-3 pr-8 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors disabled:opacity-50"
          />
          {inputMessage && (
            <button
              onClick={() => setInputMessage('')}
              className="absolute right-2 text-outline hover:text-on-surface text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors shadow-2xs shrink-0 cursor-pointer"
        >
          <span>Send</span>
          <span className="material-symbols-outlined text-[14px]">send</span>
        </button>
      </div>
    </div>
  );
};
