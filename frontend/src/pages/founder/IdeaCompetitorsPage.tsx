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
    title: 'Competitors & Defensibility Moat — NutriFit AI',
    summary: 'Competitive landscape analysis: MyFitnessPal (legacy), MacroFactor (direct), Carbon Diet Coach (direct), and Eat This Much (indirect). Our moat: autonomous closed-loop grocery execution & dynamic carb-cycling.',
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

  return (
    <div className="space-y-8">
      {/* Moat Thesis Callout */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20 mb-3">
          <span className="material-symbols-outlined text-primary-container text-[20px]">
            shield
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            The Defensibility Moat
          </h3>
        </div>
        <p className="font-body-md text-body-md text-secondary leading-relaxed">
          Competitors treat meal planning as a passive database entry problem. NutriFit AI operates as an <strong className="text-on-surface font-semibold">autonomous closed loop</strong>: sensing physical strain through wearable biometrics, dynamically periodizing carbohydrates, generating verified macro-calibrated recipes, and dispatching 1-click grocery fulfillment via Instacart.
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
                NutriFit Strategic Wedge
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
