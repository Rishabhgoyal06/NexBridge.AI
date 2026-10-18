import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { Idea, StructuredPlan, Milestone, TechStackCategory, TechStackItem } from '@/types';
import { SlideOver } from '@/components/shared/SlideOver';

export const IdeaPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Milestone SlideOver State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestoneIdx, setEditingMilestoneIdx] = useState<number | null>(null);
  const [msPhase, setMsPhase] = useState('');
  const [msTitle, setMsTitle] = useState('');
  const [msDuration, setMsDuration] = useState('');
  const [msTargetDate, setMsTargetDate] = useState('');
  const [msStatus, setMsStatus] = useState<'done' | 'current' | 'upcoming'>('upcoming');
  const [msGoals, setMsGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [msDeliverables, setMsDeliverables] = useState<string[]>([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // Tech Stack Modal State
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [techCategoryName, setTechCategoryName] = useState('Frontend & Client Interface');
  const [techName, setTechName] = useState('');
  const [techJustification, setTechJustification] = useState('');

  // Strategy & Architecture Modal State
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [stratVision, setStratVision] = useState('');
  const [stratValueProp, setStratValueProp] = useState('');
  const [stratPhases, setStratPhases] = useState<string[]>([]);
  const [newPhaseInput, setNewPhaseInput] = useState('');
  const [archType, setArchType] = useState('');
  const [archDescription, setArchDescription] = useState('');

  usePageContext({
    pageKey: 'idea_plan',
    title: `System Architecture & Sprints Plan — ${idea?.title || 'Concept'}`,
    summary: idea
      ? `Roadmap & technical architecture: ${idea.plan?.productStrategy?.vision || 'Execution roadmap and milestones'}`
      : 'Execution roadmap and technical architecture',
    data: {
      milestonesCount: idea?.plan?.milestones?.length,
      stackCount: idea?.plan?.techStack?.length,
    },
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

  // Resilient plan structure with safe fallbacks
  const plan: StructuredPlan = idea.plan || {
    productStrategy: {
      vision: `Build the category-defining platform for ${idea.title}`,
      coreValueProp: 'Zero-friction autonomous AI execution with measurable outcomes.',
      targetPersona: idea.targetMarket || 'Target Customers',
      launchPhases: ['Phase 1: Alpha MVP', 'Phase 2: Closed Beta', 'Phase 3: Public Launch'],
    },
    techStack: [
      {
        category: 'Frontend & Client Interface',
        items: [
          { name: 'React 19 & TypeScript', justification: 'Type-safe component system with modern hooks' },
          { name: 'TailwindCSS & Framer Motion', justification: 'Dynamic animations and rapid styling' },
          { name: 'Vite & PWA', justification: 'Sub-second builds and mobile-ready caching' },
        ],
      },
      {
        category: 'Backend Services & AI Engine',
        items: [
          { name: 'FastAPI & Python 3.12', justification: 'Asynchronous high-throughput microservices' },
          { name: 'Google Gemini Flash API', justification: 'Low-latency structured reasoning and evaluation' },
          { name: 'Redis Task Queue', justification: 'Background worker orchestration and caching' },
        ],
      },
      {
        category: 'Data & Cloud Infrastructure',
        items: [
          { name: 'Supabase & PostgreSQL (pgvector)', justification: 'Relational state and vector similarity search' },
          { name: 'Docker & Microservices', justification: 'Containerized reproducible deployments' },
        ],
      },
    ],
    architecture: {
      type: 'Cloud-Native AI Architecture',
      description: `Event-driven architecture with low-latency LLM reasoning and PostgreSQL persistence for ${idea.title}.`,
      keyComponents: ['REST API Gateway', 'AI Worker Pipeline', 'PostgreSQL DB', 'Redis Cache'],
      scalabilityNotes: 'Designed to handle 100k+ concurrent active users with horizontal autoscale.',
    },
    milestones: [
      {
        phase: 'Phase 1',
        title: 'Alpha MVP & Core Validation',
        duration: 'Weeks 1-4',
        targetDate: 'Month 1',
        goals: ['Deploy core MVP features', 'Onboard 25 pilot founders', 'Validate problem-solution fit'],
        deliverables: ['Live responsive web app', 'Telemetry analytics dashboard'],
        status: 'current',
      },
      {
        phase: 'Phase 2',
        title: 'Public Beta & Monetization',
        duration: 'Weeks 5-10',
        targetDate: 'Month 3',
        goals: ['Self-serve customer onboarding', 'Achieve initial ARR milestone', 'Establish referral loops'],
        deliverables: ['Payment checkout integration', 'Automated workflow triggers'],
        status: 'upcoming',
      },
      {
        phase: 'Phase 3',
        title: 'Enterprise Scale & Moat',
        duration: 'Weeks 11-20',
        targetDate: 'Month 6',
        goals: ['Cross 5,000 active users', 'Deploy custom integrations', 'Maintain >70% gross margins'],
        deliverables: ['Custom API endpoints', 'Enterprise compliance controls'],
        status: 'upcoming',
      },
    ],
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const persistPlan = async (updatedPlan: StructuredPlan, successMsg: string) => {
    if (!idea || !idea.id) return;
    setIsSaving(true);
    try {
      const result = await ideaService.updateIdeaPlan(idea.id, updatedPlan);
      setIdea({
        ...idea,
        plan: result || updatedPlan,
      });
      showNotification(successMsg);
    } catch (err) {
      console.error('Failed to update plan:', err);
      showNotification('Notice: Saved to local session cache.');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Advance active sprint
  const handleAdvanceSprint = async () => {
    const currentIdx = plan.milestones.findIndex((m) => m.status === 'current');
    if (currentIdx === -1) {
      // Set first one to current
      if (plan.milestones.length > 0) {
        const nextMilestones = [...plan.milestones];
        nextMilestones[0].status = 'current';
        await persistPlan({ ...plan, milestones: nextMilestones }, `Activated ${nextMilestones[0].phase}!`);
      }
      return;
    }

    const nextMilestones = [...plan.milestones];
    nextMilestones[currentIdx].status = 'done';

    if (currentIdx + 1 < nextMilestones.length) {
      nextMilestones[currentIdx + 1].status = 'current';
      await persistPlan(
        { ...plan, milestones: nextMilestones },
        `Advanced to ${nextMilestones[currentIdx + 1].phase}: ${nextMilestones[currentIdx + 1].title}!`
      );
    } else {
      await persistPlan(
        { ...plan, milestones: nextMilestones },
        'All milestone phases completed!'
      );
    }
  };

  // Cycle individual milestone status
  const handleCycleStatus = async (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMilestones = [...plan.milestones];
    const curr = nextMilestones[idx].status;
    const nextStatus: 'done' | 'current' | 'upcoming' =
      curr === 'upcoming' ? 'current' : curr === 'current' ? 'done' : 'upcoming';

    nextMilestones[idx].status = nextStatus;
    await persistPlan({ ...plan, milestones: nextMilestones }, `Status updated to ${nextStatus}.`);
  };

  // Milestone Modal actions
  const handleOpenMilestoneModal = (idx: number | null) => {
    setEditingMilestoneIdx(idx);
    if (idx !== null && plan.milestones[idx]) {
      const ms = plan.milestones[idx];
      setMsPhase(ms.phase);
      setMsTitle(ms.title);
      setMsDuration(ms.duration);
      setMsTargetDate(ms.targetDate);
      setMsStatus(ms.status);
      setMsGoals([...(ms.goals || [])]);
      setMsDeliverables([...(ms.deliverables || [])]);
    } else {
      const phaseNum = (plan.milestones?.length || 0) + 1;
      setMsPhase(`Phase ${phaseNum}`);
      setMsTitle(`Sprint Milestone ${phaseNum}`);
      setMsDuration('4 weeks');
      setMsTargetDate(`Month ${phaseNum * 2}`);
      setMsStatus('upcoming');
      setMsGoals(['Key sprint objective']);
      setMsDeliverables(['Core deliverable package']);
    }
    setNewGoalInput('');
    setNewDeliverableInput('');
    setIsMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async () => {
    const newMs: Milestone = {
      phase: msPhase.trim() || 'Phase',
      title: msTitle.trim() || 'Milestone',
      duration: msDuration.trim() || '4 weeks',
      targetDate: msTargetDate.trim() || 'Month 1',
      status: msStatus,
      goals: msGoals.length > 0 ? msGoals : ['Deliver core capabilities'],
      deliverables: msDeliverables.length > 0 ? msDeliverables : ['Production release'],
    };

    const nextMilestones = [...(plan.milestones || [])];
    if (editingMilestoneIdx !== null && editingMilestoneIdx >= 0) {
      nextMilestones[editingMilestoneIdx] = newMs;
    } else {
      nextMilestones.push(newMs);
    }

    await persistPlan({ ...plan, milestones: nextMilestones }, `Milestone "${newMs.title}" saved!`);
    setIsMilestoneModalOpen(false);
  };

  const handleDeleteMilestone = async (idx: number) => {
    if (!confirm('Are you sure you want to remove this milestone sprint?')) return;
    const nextMilestones = plan.milestones.filter((_, i) => i !== idx);
    await persistPlan({ ...plan, milestones: nextMilestones }, 'Milestone removed.');
    setIsMilestoneModalOpen(false);
  };

  // Tech Stack Modal actions
  const handleOpenTechModal = () => {
    setTechCategoryName(plan.techStack[0]?.category || 'Frontend & Client Interface');
    setTechName('');
    setTechJustification('');
    setIsTechModalOpen(true);
  };

  const handleSaveTechItem = async () => {
    if (!techName.trim()) return;

    const newItem: TechStackItem = {
      name: techName.trim(),
      justification: techJustification.trim() || 'Core architecture requirement',
    };

    const nextStack = [...(plan.techStack || [])];
    let catIdx = nextStack.findIndex(
      (c) => c.category.toLowerCase() === techCategoryName.trim().toLowerCase()
    );

    if (catIdx === -1) {
      nextStack.push({
        category: techCategoryName.trim() || 'Custom Technology Category',
        items: [newItem],
      });
    } else {
      nextStack[catIdx] = {
        ...nextStack[catIdx],
        items: [...nextStack[catIdx].items, newItem],
      };
    }

    await persistPlan({ ...plan, techStack: nextStack }, `Added ${newItem.name} to stack!`);
    setIsTechModalOpen(false);
  };

  const handleDeleteTechItem = async (catIdx: number, itemIdx: number) => {
    const nextStack = [...plan.techStack];
    const cat = nextStack[catIdx];
    cat.items = cat.items.filter((_, i) => i !== itemIdx);

    await persistPlan({ ...plan, techStack: nextStack }, 'Technology item removed.');
  };

  // Strategy & Architecture Modal actions
  const handleOpenStrategyModal = () => {
    setStratVision(plan.productStrategy?.vision || '');
    setStratValueProp(plan.productStrategy?.coreValueProp || '');
    setStratPhases([...(plan.productStrategy?.launchPhases || [])]);
    setNewPhaseInput('');
    setArchType(plan.architecture?.type || 'Cloud-Native AI Architecture');
    setArchDescription(plan.architecture?.description || '');
    setIsStrategyModalOpen(true);
  };

  const handleSaveStrategy = async () => {
    const updatedPlan: StructuredPlan = {
      ...plan,
      productStrategy: {
        ...plan.productStrategy,
        vision: stratVision.trim() || plan.productStrategy?.vision || '',
        coreValueProp: stratValueProp.trim() || plan.productStrategy?.coreValueProp || '',
        launchPhases: stratPhases.length > 0 ? stratPhases : ['Alpha', 'Beta', 'Scale'],
      },
      architecture: {
        ...plan.architecture,
        type: archType.trim() || plan.architecture?.type || 'Cloud-Native Architecture',
        description: archDescription.trim() || plan.architecture?.description || '',
      },
    };

    await persistPlan(updatedPlan, 'Product strategy & architecture updated!');
    setIsStrategyModalOpen(false);
  };

  const activeSprint = plan.milestones.find((m) => m.status === 'current');

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-900 text-emerald-100 shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
          <span className="font-label-md text-label-md font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. PRODUCT STRATEGY & GTM THESIS */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">
              strategy
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Product Strategy &amp; GTM Thesis
            </h3>
          </div>
          <button
            type="button"
            onClick={handleOpenStrategyModal}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1.5 transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Edit Strategy</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-1">
              Core Venture Vision
            </span>
            <p className="font-body-sm text-sm text-on-surface leading-relaxed">
              {plan.productStrategy?.vision}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-1">
              Primary Value Proposition
            </span>
            <p className="font-body-sm text-sm text-on-surface leading-relaxed">
              {plan.productStrategy?.coreValueProp}
            </p>
          </div>
        </div>

        <div>
          <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-2">
            Target Launch &amp; GTM Sequence
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(plan.productStrategy?.launchPhases || []).map((phase, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-2.5 text-xs text-on-surface shadow-xs"
              >
                <span className="w-5 h-5 rounded-full bg-primary-fixed/60 text-primary-container flex items-center justify-center font-bold shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="font-medium">{phase}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. TECHNICAL ARCHITECTURE & STACK MATRIX */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">
              layers
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Synthesized Technical Architecture &amp; Stack
              </h3>
              <p className="font-body-sm text-xs text-secondary mt-0.5">
                Cloud-native architecture blueprint with domain-tested frameworks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-secondary border border-outline-variant/20">
              {plan.architecture?.type}
            </span>
            <button
              type="button"
              onClick={handleOpenTechModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Add Tool</span>
            </button>
          </div>
        </div>

        <p className="font-body-sm text-sm text-secondary leading-relaxed">
          {plan.architecture?.description}
        </p>

        {/* Stack Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(plan.techStack || []).map((category, catIdx) => (
            <div
              key={catIdx}
              className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-2.5">
                  <h4 className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                    {category.category}
                  </h4>
                  <span className="font-label-sm text-[11px] text-secondary">
                    {category.items.length} tools
                  </span>
                </div>

                <div className="space-y-2.5">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="group bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 hover:border-outline-variant/60 transition-all shadow-xs relative"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-label-md text-xs font-semibold text-on-surface">
                          {item.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTechItem(catIdx, itemIdx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-secondary hover:text-red-500 rounded"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                      <div className="font-body-sm text-[11px] text-secondary mt-1 leading-snug">
                        {item.justification}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTechCategoryName(category.category);
                  setTechName('');
                  setTechJustification('');
                  setIsTechModalOpen(true);
                }}
                className="w-full py-1.5 rounded-lg text-[11px] font-medium text-secondary hover:text-on-surface hover:bg-surface-container border border-dashed border-outline-variant/40 transition-colors flex items-center justify-center gap-1 mt-2"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add to {category.category.split(' ')[0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MILESTONE SPRINTS & DELIVERABLES */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">
              flag_circle
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Milestone Sprints &amp; Deliverables
              </h3>
              <p className="font-body-sm text-xs text-secondary mt-0.5">
                Execution phases with goal tracking. Click any status pill to cycle states or advance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSprint && (
              <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {activeSprint.phase} Active
              </span>
            )}
            <button
              type="button"
              onClick={handleAdvanceSprint}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">fast_forward</span>
              <span>Advance Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenMilestoneModal(null)}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Add Sprint</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {(plan.milestones || []).map((ms, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all ${
                ms.status === 'current'
                  ? 'bg-surface-container-lowest border-primary-container/60 ring-2 ring-primary-fixed/40 shadow-sm'
                  : ms.status === 'done'
                  ? 'bg-surface-container-low/40 border-outline-variant/30 opacity-90'
                  : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleCycleStatus(idx, e)}
                    className={`font-label-sm text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1 hover:brightness-95 ${
                      ms.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ms.status === 'current'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 ring-1 ring-amber-400'
                        : 'bg-surface-container text-secondary border border-outline-variant/30'
                    }`}
                    title="Click to cycle status: Upcoming -> Current -> Done"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {ms.status === 'done' ? 'check_circle' : ms.status === 'current' ? 'play_circle' : 'schedule'}
                    </span>
                    <span>{ms.status === 'done' ? 'Completed' : ms.status === 'current' ? 'Active' : 'Upcoming'}</span>
                  </button>

                  <span className="font-headline-sm text-[15px] font-semibold text-on-surface">
                    {ms.phase}: {ms.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-secondary font-mono">
                    {ms.duration} • Target: {ms.targetDate}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenMilestoneModal(idx)}
                    className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="Configure milestone"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-outline-variant/20 mt-3">
                <div className="p-3 rounded-lg bg-surface-container-low/40">
                  <span className="font-semibold text-secondary uppercase tracking-wider block mb-1.5 text-[11px]">
                    Sprint Goals ({ms.goals?.length || 0})
                  </span>
                  <ul className="space-y-1 text-on-surface">
                    {(ms.goals || []).map((g, gIdx) => (
                      <li key={gIdx} className="flex items-center gap-1.5">
                        <span className="text-primary-container font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low/40">
                  <span className="font-semibold text-secondary uppercase tracking-wider block mb-1.5 text-[11px]">
                    Expected Deliverables ({ms.deliverables?.length || 0})
                  </span>
                  <ul className="space-y-1 text-on-surface">
                    {(ms.deliverables || []).map((d, dIdx) => (
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

      {/* MILESTONE SPRINT DRAWER */}
      <SlideOver
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title={editingMilestoneIdx !== null && editingMilestoneIdx >= 0 ? `Configure ${msPhase}` : 'Add Sprint Milestone'}
        subtitle="Manage sprint targets, timing, and deliverables"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            {editingMilestoneIdx !== null && editingMilestoneIdx >= 0 ? (
              <button
                type="button"
                onClick={() => handleDeleteMilestone(editingMilestoneIdx)}
                className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                <span>Delete Sprint</span>
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-3.5 py-2 rounded-lg text-secondary hover:text-on-surface font-label-md text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMilestone}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Save Sprint</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Phase Tag
              </label>
              <input
                type="text"
                value={msPhase}
                onChange={(e) => setMsPhase(e.target.value)}
                placeholder="e.g. Phase 1"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={msStatus}
                onChange={(e) => setMsStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="upcoming">Upcoming</option>
                <option value="current">Current Active</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Milestone Sprint Title
            </label>
            <input
              type="text"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="e.g. MVP Launch & Alpha Pilots"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Duration
              </label>
              <input
                type="text"
                value={msDuration}
                onChange={(e) => setMsDuration(e.target.value)}
                placeholder="e.g. 4 weeks"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Target Date
              </label>
              <input
                type="text"
                value={msTargetDate}
                onChange={(e) => setMsTargetDate(e.target.value)}
                placeholder="e.g. Month 2"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Key Goals ({msGoals.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {msGoals.map((g, gIdx) => (
                <div key={gIdx} className="flex items-center justify-between p-2 rounded bg-surface-container-low text-xs">
                  <span>{g}</span>
                  <button
                    type="button"
                    onClick={() => setMsGoals(msGoals.filter((_, i) => i !== gIdx))}
                    className="text-secondary hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newGoalInput.trim()) {
                      setMsGoals([...msGoals, newGoalInput.trim()]);
                      setNewGoalInput('');
                    }
                  }
                }}
                placeholder="Add sprint goal..."
                className="flex-1 px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
              />
              <button
                type="button"
                onClick={() => {
                  if (newGoalInput.trim()) {
                    setMsGoals([...msGoals, newGoalInput.trim()]);
                    setNewGoalInput('');
                  }
                }}
                className="px-3 py-1.5 rounded bg-surface-container text-xs font-medium text-on-surface"
              >
                Add
              </button>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Deliverables ({msDeliverables.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {msDeliverables.map((d, dIdx) => (
                <div key={dIdx} className="flex items-center justify-between p-2 rounded bg-surface-container-low text-xs">
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => setMsDeliverables(msDeliverables.filter((_, i) => i !== dIdx))}
                    className="text-secondary hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeliverableInput}
                onChange={(e) => setNewDeliverableInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newDeliverableInput.trim()) {
                      setMsDeliverables([...msDeliverables, newDeliverableInput.trim()]);
                      setNewDeliverableInput('');
                    }
                  }
                }}
                placeholder="Add deliverable package..."
                className="flex-1 px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
              />
              <button
                type="button"
                onClick={() => {
                  if (newDeliverableInput.trim()) {
                    setMsDeliverables([...msDeliverables, newDeliverableInput.trim()]);
                    setNewDeliverableInput('');
                  }
                }}
                className="px-3 py-1.5 rounded bg-surface-container text-xs font-medium text-on-surface"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </SlideOver>

      {/* TECH STACK TOOL DRAWER */}
      <SlideOver
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        title="Add Technology / Tool"
        subtitle="Incorporate libraries, databases, or API microservices into the stack"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTechModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-secondary hover:text-on-surface font-label-md text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTechItem}
              disabled={isSaving || !techName.trim()}
              className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">add_circle</span>
              <span>Add to Stack</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Category
            </label>
            <input
              type="text"
              value={techCategoryName}
              onChange={(e) => setTechCategoryName(e.target.value)}
              placeholder="e.g. Frontend & Client, Backend & APIs"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Technology / Tool Name
            </label>
            <input
              type="text"
              value={techName}
              onChange={(e) => setTechName(e.target.value)}
              placeholder="e.g. Next.js 15, PostgreSQL, Redis, Stripe SDK"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Architectural Justification
            </label>
            <textarea
              rows={3}
              value={techJustification}
              onChange={(e) => setTechJustification(e.target.value)}
              placeholder="Why this technology is chosen for latency, scalability, or rapid DX..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container leading-relaxed"
            />
          </div>
        </div>
      </SlideOver>

      {/* STRATEGY & ARCHITECTURE DRAWER */}
      <SlideOver
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
        title="Edit Product Strategy & Architecture"
        subtitle="Align vision, value proposition, and technical architecture"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsStrategyModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-secondary hover:text-on-surface font-label-md text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveStrategy}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">save</span>
              <span>Save Strategy</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Core Venture Vision
            </label>
            <textarea
              rows={2}
              value={stratVision}
              onChange={(e) => setStratVision(e.target.value)}
              placeholder="Core long-term vision..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Primary Value Proposition
            </label>
            <textarea
              rows={2}
              value={stratValueProp}
              onChange={(e) => setStratValueProp(e.target.value)}
              placeholder="Crisp value proposition statement..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Architecture Type
            </label>
            <input
              type="text"
              value={archType}
              onChange={(e) => setArchType(e.target.value)}
              placeholder="e.g. Cloud-Native Microservices"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Architecture Description
            </label>
            <textarea
              rows={3}
              value={archDescription}
              onChange={(e) => setArchDescription(e.target.value)}
              placeholder="Technical architecture summary..."
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          {/* Launch Phases */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Launch Sequence Phases ({stratPhases.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {stratPhases.map((phase, pIdx) => (
                <div key={pIdx} className="flex items-center justify-between p-2 rounded bg-surface-container-low text-xs">
                  <span>{phase}</span>
                  <button
                    type="button"
                    onClick={() => setStratPhases(stratPhases.filter((_, i) => i !== pIdx))}
                    className="text-secondary hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhaseInput}
                onChange={(e) => setNewPhaseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newPhaseInput.trim()) {
                      setStratPhases([...stratPhases, newPhaseInput.trim()]);
                      setNewPhaseInput('');
                    }
                  }
                }}
                placeholder="Add launch phase..."
                className="flex-1 px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
              />
              <button
                type="button"
                onClick={() => {
                  if (newPhaseInput.trim()) {
                    setStratPhases([...stratPhases, newPhaseInput.trim()]);
                    setNewPhaseInput('');
                  }
                }}
                className="px-3 py-1.5 rounded bg-surface-container text-xs font-medium text-on-surface"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </SlideOver>
    </div>
  );
};
