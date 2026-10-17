import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea } from '@/types';

export const IdeaPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  usePageContext({
    pageKey: 'idea_plan',
    title: `System Architecture & Sprints Plan — ${idea?.title || 'Venture'}`,
    summary: `Execution roadmap and technical architecture for ${idea?.title || 'Venture'}: ${idea?.plan?.architecture?.type || 'Modern Cloud Architecture'}, ${idea?.plan?.milestones?.length || 3}-stage milestone timeline.`,
    data: { milestonesCount: idea?.plan?.milestones?.length, stackCount: idea?.plan?.techStack?.length },
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
      {/* 1. Product Strategy Section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-primary-container text-[20px]">
            strategy
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Product Strategy &amp; GTM Thesis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-surface-container-low/50">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-1">
              Core Vision
            </span>
            <p className="font-body-sm text-sm text-on-surface leading-relaxed">
              {idea.plan.productStrategy.vision}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-container-low/50">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-1">
              Primary Value Proposition
            </span>
            <p className="font-body-sm text-sm text-on-surface leading-relaxed">
              {idea.plan.productStrategy.coreValueProp}
            </p>
          </div>
        </div>

        <div>
          <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-2">
            Target Launch Sequence
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {idea.plan.productStrategy.launchPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-2.5 text-xs text-on-surface"
              >
                <span className="w-5 h-5 rounded-full bg-primary-fixed/60 text-primary-container flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <span>{phase}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Technical Stack Matrix */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              layers
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Synthesized Technical Architecture &amp; Stack
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            {idea.plan.architecture.type}
          </span>
        </div>

        <p className="font-body-sm text-sm text-secondary leading-relaxed">
          {idea.plan.architecture.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {idea.plan.techStack.map((category, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 space-y-3"
            >
              <h4 className="font-headline-sm text-sm font-semibold text-on-surface border-b border-outline-variant/20 pb-2">
                {category.category}
              </h4>
              <div className="space-y-2.5">
                {category.items.map((item, iIdx) => (
                  <div key={iIdx} className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20">
                    <div className="font-label-md text-xs font-semibold text-on-surface">
                      {item.name}
                    </div>
                    <div className="font-body-sm text-[11px] text-secondary mt-0.5">
                      {item.justification}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Milestone Sprints Timeline */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              flag_circle
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Milestone Sprints &amp; Deliverables
            </h3>
          </div>
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">
            Sprint 2 Active
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {idea.plan.milestones.map((ms, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                ms.status === 'current'
                  ? 'bg-surface-container-lowest border-primary-container/60 ring-2 ring-primary-fixed/40 shadow-sm'
                  : ms.status === 'done'
                  ? 'bg-surface-container-low/30 border-outline-variant/30 opacity-80'
                  : 'bg-surface-container-lowest border-outline-variant/30'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-label-sm text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      ms.status === 'done'
                        ? 'bg-primary-fixed/40 text-primary-container'
                        : ms.status === 'current'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {ms.phase}
                  </span>
                  <span className="font-headline-sm text-sm font-semibold text-on-surface">
                    {ms.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-secondary font-mono">
                  <span>{ms.duration}</span>
                  <span>• Target: {ms.targetDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-outline-variant/20 mt-2">
                <div>
                  <span className="font-semibold text-secondary uppercase tracking-wider block mb-1">
                    Goals
                  </span>
                  <ul className="space-y-1 text-on-surface">
                    {ms.goals.map((g, gIdx) => (
                      <li key={gIdx} className="flex items-center gap-1.5">
                        <span className="text-primary-container font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-secondary uppercase tracking-wider block mb-1">
                    Deliverables
                  </span>
                  <ul className="space-y-1 text-on-surface">
                    {ms.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <span className="text-primary-container font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
