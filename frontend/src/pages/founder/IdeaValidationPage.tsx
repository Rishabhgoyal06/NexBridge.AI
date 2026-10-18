import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea } from '@/types';
import { ScoreRing } from '@/components/shared/ScoreRing';
import { RadarChart } from '@/components/shared/RadarChart';
import { AgentRow } from '@/components/shared/AgentRow';

export const IdeaValidationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  usePageContext({
    pageKey: 'idea_validation',
    title: `5-Agent Parallel Validation — ${idea?.title || 'Concept'}`,
    summary: idea ? `Parallel validation synthesis: ${idea.score}/100 score. ${idea.agents?.map((a) => `${a.name} (${a.score}%)`).join(', ')}` : 'Parallel 5-agent stress test and synthesis',
    data: { score: idea?.score, agents: idea?.agents?.map((a) => ({ name: a.name, score: a.score })) },
  });

  useEffect(() => {
    async function load() {
      if (id) {
        const found = await ideaService.getIdeaById(id);
        setIdea(found);
      }
    }
    load();
  }, [id]);

  if (!idea) return null;

  const getConvictionReasoning = () => {
    if (!idea.agents || idea.agents.length === 0) {
      return 'Weighted composite index calculated across market demand, unit economics, and execution risk vectors.';
    }
    const sorted = [...idea.agents].sort((a, b) => b.score - a.score);
    const topAgent = sorted[0];
    const lowestAgent = sorted[sorted.length - 1];

    if (idea.score >= 80) {
      return `High venture conviction anchored by strong ${topAgent.name} signals (${topAgent.score}/100), with manageable ${lowestAgent.name.toLowerCase()} execution trade-offs (${lowestAgent.score}/100).`;
    } else if (idea.score >= 70) {
      return `Solid opportunity led by ${topAgent.name} (${topAgent.score}/100), tempered by ${lowestAgent.name} (${lowestAgent.score}/100): "${lowestAgent.verdict}"`;
    } else {
      return `Cautionary conviction: ${lowestAgent.name} flagged critical resistance (${lowestAgent.score}/100) that dampens initial ${topAgent.name} traction (${topAgent.score}/100).`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Multi-Vector Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Score Ring & Summary (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-card flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/25 mb-4">
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Synthesized Conviction
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-label-sm text-label-sm font-semibold border border-primary-container/20">
                {idea.signal}
              </span>
            </div>
            <ScoreRing score={idea.score} signalTier={idea.signal} />
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/25 -mx-6 -mb-6 p-4 bg-surface-container-low/60 rounded-b-xl text-center">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold block mb-1">
              Conviction Driver
            </span>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed font-medium">
              {getConvictionReasoning()}
            </p>
          </div>
        </div>

        {/* Multi-Dimensional Radar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/40 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/25">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Validation Vector Analysis
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-mono">
              Scale 0 - 100
            </span>
          </div>

          <div className="py-2">
            <RadarChart metrics={idea.metrics} height={260} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 border-t border-outline-variant/25 text-center">
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-lg p-2 flex flex-col items-center">
              <span className="text-[11px] text-secondary font-medium">Demand</span>
              <span className="text-sm font-bold text-on-surface font-mono mt-0.5">{idea.metrics.marketDemand}%</span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-lg p-2 flex flex-col items-center">
              <span className="text-[11px] text-secondary font-medium">Economics</span>
              <span className="text-sm font-bold text-on-surface font-mono mt-0.5">{idea.metrics.unitEconomics}%</span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-lg p-2 flex flex-col items-center">
              <span className="text-[11px] text-secondary font-medium">Feasibility</span>
              <span className="text-sm font-bold text-on-surface font-mono mt-0.5">{idea.metrics.technicalFeasibility}%</span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-lg p-2 flex flex-col items-center">
              <span className="text-[11px] text-secondary font-medium">Moat</span>
              <span className="text-sm font-bold text-on-surface font-mono mt-0.5">{idea.metrics.competitiveMoat}%</span>
            </div>
            <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-lg p-2 flex flex-col items-center">
              <span className="text-[11px] text-secondary font-medium">Timing</span>
              <span className="text-sm font-bold text-on-surface font-mono mt-0.5">{idea.metrics.timingExecution}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 AI Validation Agents Deep-Dive */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Parallel 5-Agent Interrogation &amp; Follow-Up Advisory
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Review detailed synthesis, or open a follow-up conversation on any sub-parameter to challenge risks and refine strategy.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-secondary font-medium shrink-0">
            5 / 5 Agents Executed
          </span>
        </div>

        {/* Discussion Guide Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </div>
            <div>
              <span className="font-semibold text-xs text-on-surface block">
                Sub-Parameter Follow-Up Discussions Enabled
              </span>
              <span className="text-[11px] text-secondary">
                Hover over any Key Finding or Flagged Vulnerability to launch a targeted sub-parameter discussion, or toggle the full thread below.
              </span>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Live Multi-Agent Discussion</span>
          </span>
        </div>

        <div className="space-y-3">
          {idea.agents.map((agent, index) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              ideaId={idea.id}
              ideaTitle={idea.title}
              category={idea.category}
              discussions={idea.agentDiscussions?.[agent.name] || []}
              defaultExpanded={index === 0 || agent.status === 'flagged'}
            />
          ))}
        </div>
      </div>

      {/* Strengths & Critical Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              verified
            </span>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Synthesized Core Moats
            </h4>
          </div>

          <div className="space-y-3">
            {idea.strengths.map((str, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline-sm text-[14px] font-semibold text-on-surface">
                    {str.title}
                  </span>
                  <span className="font-mono text-xs font-semibold text-primary-container">
                    Score: {str.score}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                  {str.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Risks & Mitigations */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-amber-700 text-[20px]">
              warning
            </span>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Pre-Mortem Threats &amp; Mitigations
            </h4>
          </div>

          <div className="space-y-3">
            {idea.risks.map((risk, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline-sm text-[14px] font-semibold text-on-surface">
                    {risk.title}
                  </span>
                  <span
                    className={`font-label-sm text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                      risk.severity === 'high'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {risk.severity} Risk
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary mb-2">
                  {risk.description}
                </p>
                <div className="pt-2 border-t border-outline-variant/20 flex items-start gap-1.5 font-body-sm text-xs text-on-surface">
                  <span className="font-semibold text-primary-container">Mitigation:</span>
                  <span>{risk.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
