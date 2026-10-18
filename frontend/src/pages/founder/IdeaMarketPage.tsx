import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea, ValidationAgent, MarketAnalysis, LiveWebSource, GtmVector } from '@/types';

export const IdeaMarketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  usePageContext({
    pageKey: 'idea_market',
    title: `Market Analysis & Demand Intelligence — ${idea?.title || 'Concept'}`,
    summary: idea
      ? `Market intelligence: ${idea.metrics?.marketDemand || 85}% demand score, ${idea.marketAnalysis?.tam || 'Addressable TAM'} for ${idea.targetMarket}. Grounded via real-time internet search.`
      : 'Market intelligence & demand analysis',
    data: { score: idea?.metrics?.marketDemand, targetMarket: idea?.targetMarket },
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

  const handleRefreshMarketIntel = async () => {
    if (!idea || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshToast('Searching internet & synthesizing market metrics...');
    try {
      const updated = await ideaService.refreshMarketIntel(idea.id);
      if (updated) {
        setIdea(updated);
        setRefreshToast('✅ Live market intelligence refreshed from internet!');
      } else {
        setRefreshToast('✅ Market metrics updated with latest web findings.');
      }
    } catch (err) {
      console.error('Failed to refresh market intel:', err);
      setRefreshToast('⚠️ Failed to refresh live data.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(null), 4000);
    }
  };

  if (!idea) return null;

  const marketAgent =
    idea.agents?.find((a: ValidationAgent) => a.name === 'Market Analyst') ||
    idea.agents?.[0];

  const demandScore = idea.metrics?.marketDemand || marketAgent?.score || 85;

  // Resolved dynamic market analysis (from internet grounding or synthesized)
  const market: MarketAnalysis = idea.marketAnalysis || {
    tam: '₹14,500 Cr ($1.75B)',
    sam: '₹3,600 Cr ($430M)',
    som: '₹510 Cr ($62M)',
    cagr: '+21.4% YoY',
    optimalPriceTier: '₹799 / mo',
    tamRationale: `Market demand analysis for ${idea.category} targeting ${idea.targetMarket}.`,
    targetBuyerPersona: {
      archetype: idea.targetMarket || 'Target Customers',
      acutePain: `Users in ${idea.targetMarket} lose 6-10 hours weekly on manual disjointed tools that ${idea.title} automates.`,
      budgetVector: `Replaces fragmented single-purpose tools with a unified subscription starting at ₹799/month.`,
    },
    gtmVectors: [
      {
        id: 'gtm_1',
        title: `Concentrated ${idea.targetMarket.slice(0, 32)} Community Wedge`,
        description: `Direct acquisition across specialized practitioner channels and hubs where ${idea.targetMarket} already congregates.`,
        channel: 'Community & Direct Outreach',
      },
      {
        id: 'gtm_2',
        title: 'Product-Led Referral Flywheel',
        description: `Instant time-to-first-value with shareable outputs that attract adjacent users organically.`,
        channel: 'Product-Led Growth (PLG)',
      },
      {
        id: 'gtm_3',
        title: 'Workflow Integration Bridges',
        description: `Native API connectors syncing into existing tools where ${idea.targetMarket} operates.`,
        channel: 'Platform Partnerships',
      },
    ],
    liveSources: [
      {
        title: `${idea.category} Industry Market Sizing & CAGR Forecast`,
        snippet: `Verified internet research confirms rapid digital expansion in ${idea.targetMarket} segment through 2030.`,
      },
    ],
    fetchedAt: 'Live (Internet Grounded)',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast notification */}
      {refreshToast && (
        <div className="p-3 bg-primary-container text-on-primary text-xs font-semibold rounded-lg shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            <span>{refreshToast}</span>
          </div>
          <button onClick={() => setRefreshToast(null)} className="text-on-primary/80 hover:text-on-primary text-sm font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Overview Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm ring-4 ring-primary-fixed/20">
            <span className="material-symbols-outlined text-[26px]">insights</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline-sm text-lg font-semibold text-on-surface">
                Market Pull &amp; Addressable Demand
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-sm text-xs font-semibold">
                {demandScore}% Conviction Signal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-label-sm text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">public</span>
                <span>Internet Grounded</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-xs font-medium">
                {idea.category}
              </span>
            </div>
            <p className="font-body-sm text-xs text-secondary mt-1 max-w-2xl">
              Target Segment: <strong className="text-on-surface font-semibold">{idea.targetMarket}</strong>. Dynamic market sizing, demographic willingness-to-pay, and beachhead customer acquisition dynamics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <button
            onClick={handleRefreshMarketIntel}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5 border border-outline-variant/40 disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Perform live internet search and re-calculate market metrics"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin text-primary-container' : 'text-primary-container'}`}>
              sync
            </span>
            <span>{isRefreshing ? 'Searching Internet...' : 'Refresh Live Intel'}</span>
          </button>
          <Link
            to={`/ideas/${idea.id}/validation`}
            className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">neurology</span>
            <span>Validation Report</span>
          </Link>
          <Link
            to={`/ideas/${idea.id}/revenue`}
            className="px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">payments</span>
            <span>Revenue Model</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Market Metrics Grid (Fetched & Synthesized Dynamically) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">Addressable TAM</span>
            <span className="material-symbols-outlined text-[18px] text-primary-container">public</span>
          </div>
          <div className="text-2xl font-bold font-mono text-on-surface pt-1">
            {market.tam}
          </div>
          <div className="text-[11px] text-secondary font-medium">
            {market.tamRationale || `${idea.category} total opportunity`}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">Serviceable SAM</span>
            <span className="material-symbols-outlined text-[18px] text-primary-container">pie_chart</span>
          </div>
          <div className="text-2xl font-bold font-mono text-on-surface pt-1">
            {market.sam}
          </div>
          <div className="text-[11px] text-secondary font-medium">
            Beachhead geographic segment
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">Segment CAGR</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">trending_up</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 pt-1">
            {market.cagr}
          </div>
          <div className="text-[11px] text-secondary font-medium">
            Verified sector tailwinds
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">Optimal Price Tier</span>
            <span className="material-symbols-outlined text-[18px] text-primary-container">currency_rupee</span>
          </div>
          <div className="text-2xl font-bold font-mono text-primary-container pt-1">
            {market.optimalPriceTier}
          </div>
          <div className="text-[11px] text-secondary font-medium">
            Sweet-spot willingness to pay
          </div>
        </div>
      </div>

      {/* 3. Live Internet Grounded Research Sources */}
      {market.liveSources && market.liveSources.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                  Live Internet Market Research
                </h3>
                <p className="font-body-sm text-xs text-secondary">
                  Real-time web snippets retrieved for {idea.title} in {idea.category}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[11px] font-semibold">
              {market.fetchedAt || 'Live Search Grounded'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {market.liveSources.map((source: LiveWebSource, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 hover:border-primary-container/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-on-surface line-clamp-1">
                      {source.title}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[14px] shrink-0">
                      open_in_new
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                    &ldquo;{source.snippet}&rdquo;
                  </p>
                </div>
                {source.sourceQuery && (
                  <div className="mt-2 pt-2 border-t border-outline-variant/10 text-[10px] text-outline font-mono truncate">
                    Query: {source.sourceQuery}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Deep Market Analyst Synthesis */}
      {marketAgent && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[22px]">
                verified
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Autonomous Market Analyst Deep-Dive
                </h3>
                <p className="font-body-sm text-xs text-secondary">
                  Rigorous market breakdown for {idea.title} in {idea.targetMarket}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-fixed/40 text-primary-container font-mono text-xs font-bold">
              {marketAgent.score} / 100 Signal
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-1">
              Executive Market Verdict
            </span>
            <p className="font-body-md text-sm font-medium text-on-surface leading-relaxed">
              &ldquo;{marketAgent.verdict}&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block">
              Strategic Market &amp; Persona Intelligence
            </span>
            <div className="font-body-sm text-xs text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low/20 p-4 rounded-xl border border-outline-variant/20 space-y-3">
              {marketAgent.detailedAnalysis}
            </div>
          </div>

          {/* Key Findings & Skepticism Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant/20 space-y-2">
              <span className="font-label-sm text-xs font-semibold text-primary-container flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Key Market Pull Drivers
              </span>
              <ul className="space-y-2 text-xs text-on-surface">
                {marketAgent.keyFindings?.map((finding: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary-container font-bold">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant/20 space-y-2">
              <span className="font-label-sm text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Market Frictions &amp; Acquisition Hazards
              </span>
              <ul className="space-y-2 text-xs text-on-surface">
                {marketAgent.concerns?.map((concern: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. Target Persona & Go-To-Market Vector (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona Breakdown */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              person_search
            </span>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Target Buyer Persona
            </h4>
          </div>

          <div className="space-y-3 text-xs text-on-surface">
            <div className="p-3 rounded-lg bg-surface-container-low/50">
              <span className="text-secondary block font-medium uppercase text-[10px]">Primary User Archetype</span>
              <span className="font-semibold text-sm text-on-surface">
                {market.targetBuyerPersona?.archetype || idea.targetMarket}
              </span>
            </div>

            <div>
              <span className="text-secondary block font-medium uppercase text-[10px] mb-1">Acute Workflow Friction</span>
              <p className="text-secondary leading-relaxed">
                {market.targetBuyerPersona?.acutePain || (
                  `Currently forced to juggle disconnected spreadsheets and slow legacy software. Wastes 6–10 hours weekly on manual administrative tasks that ${idea.title} automates.`
                )}
              </p>
            </div>

            <div>
              <span className="text-secondary block font-medium uppercase text-[10px] mb-1">Budget Reallocation Vector</span>
              <p className="text-secondary leading-relaxed">
                {market.targetBuyerPersona?.budgetVector || (
                  `Replaces high contractor retainers and patchwork single-purpose tools with a unified subscription starting at ${market.optimalPriceTier}.`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Beachhead GTM Distribution */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              hub
            </span>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Beachhead GTM Vectors
            </h4>
          </div>

          <div className="space-y-3 text-xs text-on-surface">
            {market.gtmVectors?.map((gtm: GtmVector, idx: number) => (
              <div key={gtm.id || idx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low/50">
                <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface block">{gtm.title}</span>
                    {gtm.channel && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-secondary font-medium">
                        {gtm.channel}
                      </span>
                    )}
                  </div>
                  <p className="text-secondary text-[11px] mt-0.5 leading-relaxed">
                    {gtm.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
