import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { ideaService } from '@/services/ideaService';
import { Idea } from '@/types';

export const IdeaWorkspaceLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);

  useEffect(() => {
    async function fetchIdea() {
      if (id) {
        const found = await ideaService.getIdeaById(id);
        setIdea(found);
      }
    }
    fetchIdea();
  }, [id]);

  const getCategoryIcon = (cat?: string) => {
    if (!cat) return 'rocket_launch';
    const lower = cat.toLowerCase();
    if (lower.includes('robot') || lower.includes('drone') || lower.includes('hardware')) return 'precision_manufacturing';
    if (lower.includes('health') || lower.includes('fitness') || lower.includes('bio')) return 'health_and_safety';
    if (lower.includes('fintech') || lower.includes('finance') || lower.includes('payment')) return 'account_balance';
    if (lower.includes('dev') || lower.includes('infra') || lower.includes('code')) return 'terminal';
    if (lower.includes('cyber') || lower.includes('security')) return 'shield';
    if (lower.includes('ed') || lower.includes('learn')) return 'school';
    if (lower.includes('commerce') || lower.includes('retail')) return 'storefront';
    if (lower.includes('legal') || lower.includes('prop')) return 'gavel';
    if (lower.includes('clean') || lower.includes('energy')) return 'eco';
    return 'hub';
  };

  const tabs = [
    { label: 'Validation Report', path: `/ideas/${id}/validation`, icon: 'neurology' },
    { label: 'Competitors & Moat', path: `/ideas/${id}/competitors`, icon: 'radar' },
    { label: 'Revenue & Economics', path: `/ideas/${id}/revenue`, icon: 'payments' },
    { label: 'System Plan & Tech', path: `/ideas/${id}/plan`, icon: 'terminal' },
    { label: 'Roles & Candidates', path: `/ideas/${id}/roles`, icon: 'groups', badge: `${idea?.roles?.length || 3}` },
    { label: 'Outreach Pipeline', path: `/ideas/${id}/outreach`, icon: 'send', badge: '4' },
  ];

  return (
    <div className="w-full flex flex-col flex-1 pb-16">
      {/* Workspace Sub-Header */}
      <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30 px-8 pt-6 pb-0">
        <div className="max-w-[1240px] mx-auto flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
                <span className="material-symbols-outlined text-[24px]">
                  {getCategoryIcon(idea?.category)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
                    {idea?.title || 'Active Concept'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-label-sm text-label-sm font-semibold">
                    {idea?.status === 'validated' ? 'Validated Signal' : 'Active Evaluation'}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">
                    Score: {idea?.score || 78}/100
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                  {idea?.tagline || idea?.description?.slice(0, 95) || 'Autonomous venture evaluation & execution'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/ideas/new"
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Concept</span>
              </Link>
              <button
                onClick={() => alert('PDF Executive Brief Exported')}
                className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Export Brief</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pt-2 scrollbar-none">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 border-b-2 font-label-md text-label-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary-container text-primary-container font-semibold'
                      : 'border-transparent text-secondary hover:text-on-surface hover:border-outline-variant/60'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded-full bg-surface-container text-secondary font-medium">
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content Canvas */}
      <div className="max-w-[1240px] mx-auto p-8 w-full">
        <Outlet context={{ idea }} />
      </div>
    </div>
  );
};
