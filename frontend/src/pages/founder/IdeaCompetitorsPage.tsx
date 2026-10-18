import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea } from '@/types';

export const IdeaCompetitorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  usePageContext({
    pageKey: 'idea_competitors',
    title: `Competitors & Defensibility Moat — ${idea?.title || 'Concept'}`,
    summary: idea ? `Competitive landscape: ${idea.competitors?.map((c) => c.name).join(', ')}. Moat: ${idea.competitors?.[0]?.ourMoat || 'Defensible workflow automation'}.` : 'Competitive landscape analysis',
    data: { competitorsCount: idea?.competitors?.length },
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

  const topMoat = idea.competitors?.find((c) => c.ourMoat)?.ourMoat;

  return (
    <div className="space-y-8">
      {/* Moat Thesis Callout */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-outline-variant/20 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              shield
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              The Defensibility Moat &amp; Competitor Matrix
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-label-sm text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">public</span>
              <span>Web Grounded</span>
            </span>
          </div>
        </div>
        <p className="font-body-md text-body-md text-secondary leading-relaxed">
          {topMoat ? (
            <span>
              {topMoat} Unlike incumbent tools that treat user interactions as passive entry logs, <strong className="text-on-surface font-semibold">{idea.title}</strong> operates as an autonomous, high-conviction system delivering immediate, end-to-end value.
            </span>
          ) : (
            <span>
              Incumbents treat the space as a passive database entry problem. <strong className="text-on-surface font-semibold">{idea.title}</strong> establishes defensibility through proprietary domain models, deep customer workflow integration, and continuous execution.
            </span>
          )}
        </p>
      </div>

      {/* Competitors Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {idea.competitors.map((comp) => (
          <div
            key={comp.id}
            className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/20 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline-sm text-[17px] font-semibold text-on-surface">
                      {comp.name}
                    </h4>
                    <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                      {comp.category}
                    </span>
                  </div>
                  <div className="font-body-sm text-xs text-secondary mt-0.5">
                    Funding/Scale: {comp.marketCapOrFunding} • Pricing: {comp.pricing}
                  </div>
                </div>

                <span
                  className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-medium ${
                    comp.threatLevel === 'High'
                      ? 'bg-amber-100 text-amber-900'
                      : comp.threatLevel === 'Medium'
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-surface-container text-secondary'
                  }`}
                >
                  {comp.threatLevel} Threat
                </span>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-surface-container-low/40">
                  <span className="font-label-sm text-xs font-semibold text-primary-container flex items-center gap-1 mb-1.5">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Incumbent Strengths
                  </span>
                  <ul className="space-y-1 text-xs text-secondary">
                    {comp.strengths.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low/40">
                  <span className="font-label-sm text-xs font-semibold text-amber-800 flex items-center gap-1 mb-1.5">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Vulnerabilities
                  </span>
                  <ul className="space-y-1 text-xs text-secondary">
                    {comp.weaknesses.map((w, idx) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Our Differentiation Moat */}
            <div className="pt-3 border-t border-outline-variant/20 bg-primary-fixed/20 p-3 rounded-lg">
              <span className="font-label-sm text-xs font-semibold text-primary-container uppercase tracking-wider block mb-0.5">
                {idea.title} Strategic Wedge
              </span>
              <p className="font-body-sm text-xs text-on-surface">
                {comp.ourMoat}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
