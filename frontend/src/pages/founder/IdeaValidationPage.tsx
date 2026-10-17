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
    title: '5-Agent Parallel Validation — NutriFit AI',
    summary: 'Parallel validation synthesis: 78/100 score. Market Analyst (84%), Competitor Researcher (68%), Revenue Critic (74%), Technical Architect (82%), Skeptic (59% flagged risk).',
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

  return (
    <div className="space-y-8">
      {/* Top Multi-Vector Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Score Ring & Summary (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Synthesized Conviction
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-label-sm text-label-sm font-semibold">
                {idea.signal}
              </span>
            </div>
            <ScoreRing score={idea.score} signalTier={idea.signal} />
          </div>

          <div className="pt-4 border-t border-outline-variant/20 text-center">
            <p className="font-body-sm text-body-sm text-secondary">
              Weighted composite from 5 autonomous agents. Sufficient conviction to assemble team and deploy alpha.
            </p>
          </div>
        </div>

        {/* Multi-Dimensional Radar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Validation Vector Analysis
            </span>
            <span className="font-label-sm text-label-sm text-secondary">
              Scale 0 - 100
            </span>
          </div>

          <div className="py-2">
            <RadarChart metrics={idea.metrics} height={260} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 border-t border-outline-variant/20 text-center">
            <div>
              <div className="text-xs text-secondary">Demand</div>
              <div className="text-sm font-bold text-on-surface font-mono">{idea.metrics.marketDemand}%</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Economics</div>
              <div className="text-sm font-bold text-on-surface font-mono">{idea.metrics.unitEconomics}%</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Tech Feasibility</div>
              <div className="text-sm font-bold text-on-surface font-mono">{idea.metrics.technicalFeasibility}%</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Moat</div>
              <div className="text-sm font-bold text-on-surface font-mono">{idea.metrics.competitiveMoat}%</div>
            </div>
            <div>
              <div className="text-xs text-secondary">Timing</div>
              <div className="text-sm font-bold text-on-surface font-mono">{idea.metrics.timingExecution}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 AI Validation Agents Deep-Dive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Parallel 5-Agent Interrogation
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Click any agent to review detailed synthesis, interview insights, and vulnerability vectors.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-secondary font-medium">
            5 / 5 Agents Executed
          </span>
        </div>

        <div className="space-y-3">
          {idea.agents.map((agent, index) => (
            <AgentRow key={agent.id} agent={agent} defaultExpanded={index === 0 || agent.status === 'flagged'} />
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
