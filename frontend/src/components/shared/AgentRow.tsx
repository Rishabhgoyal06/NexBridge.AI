import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ValidationAgent, AgentDiscussionMessage } from '@/types';
import { AgentDiscussionThread } from './AgentDiscussionThread';

interface AgentRowProps {
  agent: ValidationAgent;
  defaultExpanded?: boolean;
  ideaId?: string;
  ideaTitle?: string;
  category?: string;
  discussions?: AgentDiscussionMessage[];
}

export const AgentRow: React.FC<AgentRowProps> = ({
  agent,
  defaultExpanded = false,
  ideaId,
  ideaTitle = 'Active Concept',
  category = 'Technology',
  discussions = [],
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [activeSubParam, setActiveSubParam] = useState<string>('General Advisory');

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

  const handleStartSubParamDiscussion = (subParam: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSubParam(subParam);
    setIsDiscussionOpen(true);
    if (!expanded) setExpanded(true);
  };

  const discussionCount = discussions.length;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200">
      {/* Agent Card Header Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container shrink-0 border border-outline-variant/30 shadow-2xs">
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

          {discussionCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-medium border border-outline-variant/30">
              <span className="material-symbols-outlined text-[13px] text-primary-container">forum</span>
              <span>{discussionCount}</span>
            </span>
          )}

          {getStatusBadge()}
          <span
            className={`material-symbols-outlined text-secondary text-[20px] transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Expanded Analysis & Discussion View */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-outline-variant/30 bg-surface-container-low/40 space-y-4">
          {/* Detailed Synthesis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold block">
                Detailed Synthesis &amp; Strategic Vector
              </span>
              {ideaId && (
                <button
                  onClick={(e) => handleStartSubParamDiscussion('Detailed Synthesis & Vector', e)}
                  className="text-[11px] text-primary-container hover:text-primary font-semibold flex items-center gap-1 cursor-pointer bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/35 hover:border-primary-container shadow-2xs transition-all"
                >
                  <span className="material-symbols-outlined text-[13px]">chat</span>
                  <span>Discuss Synthesis</span>
                </button>
              )}
            </div>
            <div className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line space-y-2.5 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/35 shadow-xs">
              {agent.detailedAnalysis}
            </div>
          </div>

          {/* Key Conviction Factors & Vulnerabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Key Conviction Factors */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/35 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Key Conviction Factors
                </span>
                <span className="text-[10px] text-secondary">Hover to discuss</span>
              </div>
              <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface">
                {agent.keyFindings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 p-1 rounded-md hover:bg-surface-container-low/50 transition-colors group"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-primary-container text-xs mt-0.5">•</span>
                      <span className="text-xs leading-relaxed">{finding}</span>
                    </div>
                    {ideaId && (
                      <button
                        onClick={(e) => handleStartSubParamDiscussion(finding, e)}
                        className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] text-primary-container bg-surface-container hover:bg-primary-container hover:text-on-primary transition-all shrink-0 flex items-center gap-0.5 cursor-pointer font-medium"
                        title="Discuss this conviction factor"
                      >
                        <span className="material-symbols-outlined text-[12px]">forum</span>
                        <span>Discuss</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skepticism & Vulnerabilities */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/35 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-amber-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  Skepticism &amp; Vulnerabilities
                </span>
                <span className="text-[10px] text-secondary">Hover to counter</span>
              </div>
              <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface">
                {agent.concerns.map((concern, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors group"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-amber-600 text-xs mt-0.5">•</span>
                      <span className="text-xs leading-relaxed">{concern}</span>
                    </div>
                    {ideaId && (
                      <button
                        onClick={(e) => handleStartSubParamDiscussion(concern, e)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded text-[10px] text-amber-900 bg-amber-100/80 hover:bg-amber-600 hover:text-white border border-amber-300 transition-all shrink-0 flex items-center gap-0.5 cursor-pointer font-medium"
                        title="Counter-argue or mitigate this risk"
                      >
                        <span className="material-symbols-outlined text-[12px]">shield</span>
                        <span>Mitigate</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Row: Discuss Toggle + Sub-Page Link */}
          {ideaId && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/25">
              <button
                onClick={() => setIsDiscussionOpen(!isDiscussionOpen)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isDiscussionOpen
                    ? 'bg-primary-container text-on-primary ring-2 ring-primary-container/20'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">forum</span>
                <span>
                  {isDiscussionOpen
                    ? 'Hide Follow-Up Discussion'
                    : `Follow-Up Discussion with ${agent.name} ${discussionCount > 0 ? `(${discussionCount})` : ''}`}
                </span>
              </button>

              <div className="flex items-center gap-2">
                {agent.name === 'Market Analyst' && (
                  <Link
                    to={`/ideas/${ideaId}/market`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 text-on-surface font-label-md text-xs font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">insights</span>
                    <span>Market Intel Suite →</span>
                  </Link>
                )}
                {agent.name === 'Competitor Researcher' && (
                  <Link
                    to={`/ideas/${ideaId}/competitors`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 text-on-surface font-label-md text-xs font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">radar</span>
                    <span>Competitors &amp; Moat →</span>
                  </Link>
                )}
                {agent.name === 'Revenue Critic' && (
                  <Link
                    to={`/ideas/${ideaId}/revenue`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 text-on-surface font-label-md text-xs font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">payments</span>
                    <span>Revenue Model →</span>
                  </Link>
                )}
                {agent.name === 'Technical Architect' && (
                  <Link
                    to={`/ideas/${ideaId}/plan`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/35 text-on-surface font-label-md text-xs font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">terminal</span>
                    <span>System Architecture →</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Inline Active Follow-Up Discussion Section */}
          {ideaId && isDiscussionOpen && (
            <div className="pt-2 animate-fade-in">
              <div className="rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden bg-surface-container-lowest">
                <AgentDiscussionThread
                  agent={agent}
                  ideaId={ideaId}
                  ideaTitle={ideaTitle}
                  category={category}
                  initialSubParameter={activeSubParam}
                  existingMessages={discussions}
                  onClose={() => setIsDiscussionOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
