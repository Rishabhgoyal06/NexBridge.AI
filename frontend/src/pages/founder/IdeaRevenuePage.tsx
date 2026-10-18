import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea, PricingTier, RevenueAnalysis } from '@/types';
import { StatCard } from '@/components/shared/StatCard';
import { SlideOver } from '@/components/shared/SlideOver';
import { formatRupees } from '@/lib/currency';

export const IdeaRevenuePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  // Configure Tier SlideOver State
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('');
  const [tierBilling, setTierBilling] = useState('');
  const [tierRecommended, setTierRecommended] = useState(false);
  const [tierFeatures, setTierFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quick Edit Economics Modal
  const [isEconomicsOpen, setIsEconomicsOpen] = useState(false);
  const [editCac, setEditCac] = useState<number>(650);
  const [editLtv, setEditLtv] = useState<number>(2450);
  const [editMargin, setEditMargin] = useState<number>(74);

  usePageContext({
    pageKey: 'idea_revenue',
    title: `Revenue & Unit Economics — ${idea?.title || 'Concept'}`,
    summary: idea
      ? `Unit economics: ${idea.revenue?.ltvCacRatio}x LTV:CAC, ${formatRupees(idea.revenue?.cac)} CAC, ${formatRupees(idea.revenue?.ltv)} LTV, ${idea.revenue?.grossMargin}% margin, ${idea.revenue?.modelType}.`
      : 'Unit economics and pricing strategy in Indian Rupees (₹)',
    data: { ltvCac: idea?.revenue?.ltvCacRatio, ltv: idea?.revenue?.ltv, cac: idea?.revenue?.cac },
  });

  useEffect(() => {
    async function load() {
      if (id) {
        const found = await ideaService.getIdeaById(id);
        setIdea(found);
        if (found?.revenue) {
          const rawCac = found.revenue.cac < 500 ? Math.round(found.revenue.cac * 85) : Math.round(found.revenue.cac);
          const rawLtv = found.revenue.ltv < 500 ? Math.round(found.revenue.ltv * 85) : Math.round(found.revenue.ltv);
          setEditCac(rawCac);
          setEditLtv(rawLtv);
          setEditMargin(found.revenue.grossMargin || 74);
        }
      }
    }
    load();
  }, [id]);

  if (!idea) return null;

  const revenue: RevenueAnalysis = idea.revenue || {
    modelType: 'Subscription / Transactional',
    cac: 650,
    ltv: 2450,
    ltvCacRatio: 3.77,
    grossMargin: 74,
    paybackMonths: 3.2,
    pricingTiers: [
      { tier: 'Starter', price: '₹299', billing: 'per month', features: ['Core platform access', 'Standard analytics'] },
      { tier: 'Growth', price: '₹799', billing: 'per month', features: ['Advanced automation', 'Priority support'], recommended: true },
      { tier: 'Scale', price: '₹2,499', billing: 'per month', features: ['Custom workflows', 'Dedicated account manager'] }
    ],
    assumptions: ['High organic conversion in Indian metro markets', 'Sub-4 month payback period with localized pricing'],
    unitEconomicsSummary: 'Healthy venture model with strong gross margin profile and low CAC in INR.'
  };

  const handleOpenConfigureTier = (index: number) => {
    const target = revenue.pricingTiers[index];
    if (!target) return;
    setEditingTierIndex(index);
    setTierName(target.tier);
    setTierPrice(formatRupees(target.price));
    setTierBilling(target.billing);
    setTierRecommended(!!target.recommended);
    setTierFeatures([...(target.features || [])]);
    setNewFeatureInput('');
    setIsSlideOverOpen(true);
  };

  const handleOpenAddNewTier = () => {
    setEditingTierIndex(-1);
    setTierName('Pro Tier');
    setTierPrice('₹1,499');
    setTierBilling('per month');
    setTierRecommended(false);
    setTierFeatures(['Custom business automation', 'Direct API access', 'Priority phone support']);
    setNewFeatureInput('');
    setIsSlideOverOpen(true);
  };

  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (trimmed && !tierFeatures.includes(trimmed)) {
      setTierFeatures([...tierFeatures, trimmed]);
      setNewFeatureInput('');
    }
  };

  const handleRemoveFeature = (fIdx: number) => {
    setTierFeatures(tierFeatures.filter((_, idx) => idx !== fIdx));
  };

  const handleSaveTier = async () => {
    if (!idea || !idea.id) return;
    setIsSaving(true);

    try {
      const updatedTiers = [...(revenue.pricingTiers || [])];
      const cleanPrice = tierPrice.trim().startsWith('₹') ? tierPrice.trim() : `₹${tierPrice.trim()}`;
      const configuredTier: PricingTier = {
        tier: tierName.trim() || 'Tier',
        price: cleanPrice,
        billing: tierBilling.trim() || 'per month',
        recommended: tierRecommended,
        features: tierFeatures.length > 0 ? tierFeatures : ['Standard feature access']
      };

      if (editingTierIndex !== null && editingTierIndex >= 0) {
        // If this tier is marked recommended, unset recommended from others if desired
        if (tierRecommended) {
          updatedTiers.forEach((t, i) => {
            if (i !== editingTierIndex) t.recommended = false;
          });
        }
        updatedTiers[editingTierIndex] = configuredTier;
      } else {
        // New tier added
        if (tierRecommended) {
          updatedTiers.forEach(t => t.recommended = false);
        }
        updatedTiers.push(configuredTier);
      }

      const updatedRevenue: RevenueAnalysis = {
        ...revenue,
        pricingTiers: updatedTiers,
      };

      const result = await ideaService.updateIdeaRevenue(idea.id, updatedRevenue);
      setIdea({
        ...idea,
        revenue: result || updatedRevenue,
      });

      setSaveToast(`Tier "${configuredTier.tier}" saved successfully!`);
      setTimeout(() => setSaveToast(null), 3500);
      setIsSlideOverOpen(false);
    } catch (err) {
      console.error('Failed to update pricing tier:', err);
      alert('Could not save pricing tier. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEconomics = async () => {
    if (!idea || !idea.id) return;
    setIsSaving(true);
    try {
      const ratio = editCac > 0 ? Number((editLtv / editCac).toFixed(2)) : 3.5;
      const updatedRevenue: RevenueAnalysis = {
        ...revenue,
        cac: editCac,
        ltv: editLtv,
        grossMargin: editMargin,
        ltvCacRatio: ratio,
      };

      const result = await ideaService.updateIdeaRevenue(idea.id, updatedRevenue);
      setIdea({
        ...idea,
        revenue: result || updatedRevenue,
      });

      setSaveToast('Unit economics updated successfully!');
      setTimeout(() => setSaveToast(null), 3500);
      setIsEconomicsOpen(false);
    } catch (err) {
      console.error('Failed to update economics:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-900 text-emerald-100 shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
          <span className="font-label-md text-label-md font-medium">{saveToast}</span>
        </div>
      )}

      {/* Top Level Metric KPIs in Rupees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="LTV : CAC Ratio"
          value={`${revenue.ltvCacRatio}x`}
          subtitle="Target threshold: >3.0x"
          trend={{ value: revenue.ltvCacRatio >= 3.0 ? 'Strong Conviction' : 'Needs Optimization', isPositive: revenue.ltvCacRatio >= 3.0 }}
          icon="balance"
        />
        <StatCard
          title="Estimated User LTV"
          value={formatRupees(revenue.ltv)}
          subtitle={`Payback: ${revenue.paybackMonths} months`}
          trend={{ value: revenue.modelType || 'Recurring Model', isPositive: true }}
          icon="monetization_on"
        />
        <StatCard
          title="Blended CAC"
          value={formatRupees(revenue.cac)}
          subtitle="Customer acquisition"
          trend={{ value: 'Multi-Channel GTM', isPositive: true }}
          icon="shopping_bag"
        />
        <StatCard
          title="Gross Margin"
          value={`${revenue.grossMargin}%`}
          subtitle="Target: >70% margin"
          trend={{ value: `${revenue.grossMargin}% Gross`, isPositive: true }}
          icon="percent"
        />
      </div>

      {/* Synthesis Summary & Model Architecture */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary-container text-[22px]">currency_rupee</span>
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Revenue Architecture &amp; Unit Economics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm font-medium px-2.5 py-0.5 rounded-full bg-surface-container text-secondary">
              {revenue.modelType}
            </span>
            <button
              type="button"
              onClick={() => setIsEconomicsOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Adjust Economics</span>
            </button>
          </div>
        </div>

        <p className="font-body-md text-body-md text-secondary leading-relaxed mb-4">
          {revenue.unitEconomicsSummary}
        </p>

        <div className="p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
          <span className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">
            Key Financial Assumptions (INR)
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-on-surface">
            {(revenue.assumptions || []).map((assump, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-primary-container font-bold">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing Tiers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Configured Pricing &amp; Commercial Tiers
            </h3>
            <p className="font-body-sm text-xs text-secondary mt-0.5">
              All prices tailored for the Indian market in Rupees (₹). Click Configure Tier to edit pricing, features, or billing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddNewTier}
            className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Custom Tier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(revenue.pricingTiers || []).map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                tier.recommended
                  ? 'bg-surface-container-lowest border-2 border-primary-container shadow-md relative'
                  : 'bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:border-outline-variant/60'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-[11px] font-semibold uppercase tracking-wider shadow-sm">
                  Recommended Core Tier
                </div>
              )}

              <div>
                <div className="pb-4 border-b border-outline-variant/20 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-sm text-[17px] font-semibold text-on-surface">
                      {tier.tier}
                    </h4>
                    <span className="font-label-sm text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded">
                      Tier #{idx + 1}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-headline-xl text-3xl font-bold text-on-surface">
                      {formatRupees(tier.price)}
                    </span>
                    <span className="font-body-sm text-xs text-secondary">{tier.billing}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-on-surface">
                  {(tier.features || []).map((feat, fIdx) => (
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
                  onClick={() => handleOpenConfigureTier(idx)}
                  className={`w-full py-2.5 rounded-lg font-label-md text-label-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                    tier.recommended
                      ? 'bg-primary-container hover:bg-primary text-on-primary shadow-sm hover:shadow'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Configure Tier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIGURE TIER SLIDEOVER DRAWER */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingTierIndex !== null && editingTierIndex >= 0 ? `Configure ${tierName || 'Tier'}` : 'Create New Pricing Tier'}
        subtitle="Fine-tune tier name, Rupee pricing, cadence, and customer deliverables"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-secondary hover:text-on-surface font-label-md text-label-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTier}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Tier Name */}
          <div>
            <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Tier Name
            </label>
            <input
              type="text"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              placeholder="e.g. Starter Combo, Growth, Enterprise"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Price (Rupees) & Billing Cadence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Price (INR ₹)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tierPrice}
                  onChange={(e) => setTierPrice(e.target.value)}
                  placeholder="₹799"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Billing Cadence
              </label>
              <input
                type="text"
                value={tierBilling}
                onChange={(e) => setTierBilling(e.target.value)}
                placeholder="per month, per order, etc."
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          {/* Recommended Switch */}
          <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-center justify-between cursor-pointer" onClick={() => setTierRecommended(!tierRecommended)}>
            <div>
              <h5 className="font-label-md text-sm font-semibold text-on-surface">Core Recommended Tier</h5>
              <p className="font-body-sm text-xs text-secondary">Highlights this tier with prominent primary styling</p>
            </div>
            <input
              type="checkbox"
              checked={tierRecommended}
              onChange={(e) => setTierRecommended(e.target.checked)}
              className="w-4 h-4 text-primary-container rounded border-outline-variant focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Features List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider">
                Included Deliverables &amp; Features ({tierFeatures.length})
              </label>
            </div>

            <div className="space-y-2 mb-3">
              {tierFeatures.map((feat, fIdx) => (
                <div
                  key={fIdx}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-primary-container">check</span>
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(fIdx)}
                    className="p-1 rounded text-secondary hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Feature Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Type new feature & press Enter..."
                className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-xs focus:outline-none focus:border-primary-container"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </SlideOver>

      {/* QUICK ADJUST UNIT ECONOMICS MODAL */}
      <SlideOver
        isOpen={isEconomicsOpen}
        onClose={() => setIsEconomicsOpen(false)}
        title="Adjust Venture Unit Economics"
        subtitle="Simulate LTV, Blended CAC, and Margin in INR"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEconomicsOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-secondary hover:text-on-surface font-label-md text-label-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEconomics}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Update Metrics</span>
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Blended CAC (₹)
            </label>
            <input
              type="number"
              value={editCac}
              onChange={(e) => setEditCac(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Estimated Customer LTV (₹)
            </label>
            <input
              type="number"
              value={editLtv}
              onChange={(e) => setEditLtv(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block font-label-md text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Target Gross Margin (%)
            </label>
            <input
              type="number"
              value={editMargin}
              onChange={(e) => setEditMargin(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface font-body-md text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
            <span className="font-label-sm text-xs font-semibold text-secondary uppercase block mb-1">
              Calculated LTV : CAC Multiple
            </span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface">
              {editCac > 0 ? (editLtv / editCac).toFixed(2) : 0}x
            </span>
            <p className="font-body-sm text-xs text-secondary mt-1">
              {(editLtv / (editCac || 1)) >= 3.0 ? 'Exceeds the 3.0x venture health benchmark.' : 'Below the 3.0x benchmark. Consider optimizing conversion or raising tier pricing.'}
            </p>
          </div>
        </div>
      </SlideOver>
    </div>
  );
};
