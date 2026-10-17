import React, { useState } from 'react';
import { ValidationAgent } from '@/types';

interface AgentRowProps {
  agent: ValidationAgent;
  defaultExpanded?: boolean;
}

export const AgentRow: React.FC<AgentRowProps> = ({ agent, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-label-sm text-label-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            Verified
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/60 text-on-error-container font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Flagged Risk
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            Analyzing...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary">
            Queued
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-surface-container-low/40 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container shrink-0 border border-outline-variant/20">
            <span className="material-symbols-outlined text-[20px]">{agent.icon}</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-[15px] font-semibold text-on-surface">
                {agent.name}
              </span>
              <span className="font-label-sm text-label-sm text-secondary hidden sm:inline">
                • {agent.roleTitle}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary truncate mt-0.5">
              {agent.verdict}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <div className="font-headline-sm text-[16px] font-bold text-on-surface">
              {agent.score}
              <span className="text-[12px] font-normal text-secondary">/100</span>
            </div>
          </div>
          {getStatusBadge()}
          <span className={`material-symbols-outlined text-secondary text-[20px] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-outline-variant/20 bg-surface-container-low/20 space-y-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-medium">
              Detailed Synthesis
            </span>
            <p className="font-body-md text-body-md text-on-surface mt-1 leading-relaxed">
              {agent.detailedAnalysis}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/20">
              <span className="font-label-sm text-label-sm font-semibold text-primary-container flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                Key Conviction Factors
              </span>
              <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface">
                {agent.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary-container text-xs mt-0.5">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/20">
              <span className="font-label-sm text-label-sm font-semibold text-amber-800 flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                Skepticism &amp; Vulnerabilities
              </span>
              <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface">
                {agent.concerns.map((concern, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 text-xs mt-0.5">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
