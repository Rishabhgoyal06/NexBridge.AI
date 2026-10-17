import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea } from '@/types';
import { StatCard } from '@/components/shared/StatCard';

export const IdeaRevenuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  usePageContext({
    pageKey: 'idea_revenue',
    title: `Revenue & Unit Economics — ${idea?.title || 'Venture'}`,
    summary: `Unit economics and pricing strategy: ${idea?.revenue?.ltvCacRatio || '3.2'}x LTV:CAC ratio, $${idea?.revenue?.cac || '38'} blended CAC, $${idea?.revenue?.ltv || '120'} LTV, and ${idea?.revenue?.grossMargin || '78'}% gross margin.`,
    data: { ltvCac: idea?.revenue?.ltvCacRatio, ltv: idea?.revenue?.ltv, cac: idea?.revenue?.cac },
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
      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="LTV : CAC Ratio"
          value={`${idea.revenue.ltvCacRatio}x`}
          subtitle="Target threshold: >3.0x"
          trend={{ value: 'Strong Cohort', isPositive: true }}
          icon="balance"
        />
        <StatCard
          title="Estimated User LTV"
          value={`$${idea.revenue.ltv.toFixed(2)}`}
          subtitle="8.2 months average retention"
          trend={{ value: '+$14.20 with Affiliates', isPositive: true }}
          icon="monetization_on"
        />
        <StatCard
          title="Blended CAC"
          value={`$${idea.revenue.cac.toFixed(2)}`}
          subtitle="Creator seeding & IG ads"
          trend={{ value: '-$4.50 via Ambassadors', isPositive: true }}
          icon="shopping_bag"
        />
        <StatCard
          title="Gross Margin"
          value={`${idea.revenue.grossMargin}%`}
          subtitle="Net of vision API inference"
          trend={{ value: '78.4%', isPositive: true }}
          icon="percent"
        />
      </div>

      {/* Synthesis Summary & Model Type */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Revenue Architecture
          </span>
          <span className="font-label-sm text-label-sm font-medium px-2.5 py-0.5 rounded-full bg-surface-container text-secondary">
            {idea.revenue.modelType}
          </span>
        </div>
        <p className="font-body-md text-body-md text-secondary leading-relaxed mb-4">
          {idea.revenue.unitEconomicsSummary}
        </p>

        <div className="p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
          <span className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">
            Key Financial Assumptions
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-on-surface">
            {idea.revenue.assumptions.map((assump, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-primary-container font-bold">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div>
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-4">
          Recommended Subscription Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {idea.revenue.pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                tier.recommended
                  ? 'bg-surface-container-lowest border-2 border-primary-container shadow-md relative'
                  : 'bg-surface-container-lowest border border-outline-variant/30 shadow-sm'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                  Recommended Core Tier
                </div>
              )}

              <div>
                <div className="pb-4 border-b border-outline-variant/20 mb-4">
                  <h4 className="font-headline-sm text-[17px] font-semibold text-on-surface">
                    {tier.tier}
                  </h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-headline-xl text-3xl font-bold text-on-surface">
                      {tier.price}
                    </span>
                    <span className="font-body-sm text-xs text-secondary">{tier.billing}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-on-surface">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary-container shrink-0">
                        check
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  className={`w-full py-2 rounded-lg font-label-md text-label-md font-medium transition-colors ${
                    tier.recommended
                      ? 'bg-primary-container hover:bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  Configure Tier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
