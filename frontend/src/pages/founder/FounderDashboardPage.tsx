import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { useAuth } from '@/context/AuthContext';
import { ideaService } from '@/services/ideaService';
import { outreachService } from '@/services/outreachService';
import { mentorService } from '@/services/mentorService';
import { Idea, Candidate, MentorRequest } from '@/types';
import { ScoreRing } from '@/components/shared/ScoreRing';
import { StatCard } from '@/components/shared/StatCard';
import { SkillChip } from '@/components/shared/SkillChip';
import { MatchRing } from '@/components/shared/MatchRing';

export const FounderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [hasNoIdeas, setHasNoIdeas] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Founder';

  usePageContext({
    pageKey: 'founder_dashboard',
    title: `Founder Dashboard — ${idea?.title || 'Active Venture'}`,
    summary: `Executive overview of ${idea?.title || 'Venture'}: ${idea?.score || 78}/100 validation score, ${idea?.agents?.length || 5} active AI agents, ${candidates.length} matched candidates, and ${idea?.revenue?.ltvCacRatio || '3.2'}x LTV:CAC.`,
    data: { score: idea?.score, status: idea?.status, candidateCount: candidates.length },
  });

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        // Fetch the user's real idea list; use the most-recent one
        const ideas = await ideaService.getIdeas();
        if (!ideas || ideas.length === 0) {
          setHasNoIdeas(true);
          setIsLoading(false);
          return;
        }
        const activeIdea = ideas[0];
        setIdea(activeIdea);
        const candList = await outreachService.getCandidates('all', activeIdea);
        setCandidates(candList.slice(0, 3));
        const requests = await mentorService.getRequests();
        setMentorRequests(requests);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
          <span className="font-body-md text-secondary">Loading venture telemetry...</span>
        </div>
      </div>
    );
  }

  // New user — no ideas yet
  if (hasNoIdeas || !idea) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary-fixed/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-primary-container">rocket_launch</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
              Welcome, {user?.name?.split(' ')[0] || 'Founder'}!
            </h2>
            <p className="font-body-md text-secondary leading-relaxed">
              You don't have any venture ideas yet. Submit your first concept and our 5 AI agents will validate it in real-time.
            </p>
          </div>
          <Link
            to="/ideas/new"
            className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-label-md font-semibold flex items-center gap-2 hover:bg-primary transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Submit Your First Idea
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20">
      {/* GREETING & STATUS BANNER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface font-semibold">
              {getGreeting()}, {displayName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Active Sprint
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Here is your validation progress and recommended moves for{' '}
            <strong className="text-on-surface font-medium">{idea.title}</strong> today.
          </p>
        </div>

        {/* Live Sync Chip */}
        <div className="flex items-center self-start md:self-auto gap-2.5 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-body-sm text-body-sm text-secondary">
            Last synced 14m ago with Stripe &amp; PostHog
          </span>
          <button
            className="text-secondary hover:text-on-surface transition-colors flex items-center"
            title="Trigger sync"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </section>

      {/* BENTO GRID */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* CARD 1: VALIDATION SCORE (5 COLS) */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Validation score
              </span>
              <div className="group relative cursor-pointer flex items-center text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-inverse-surface text-inverse-on-surface text-label-sm font-label-sm rounded shadow-lg pointer-events-none z-20">
                  Aggregated weighted index across market pulls, interviews, and economics.
                </div>
              </div>
            </div>
            <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-medium">
              {idea.category}
            </span>
          </div>

          {/* Circular Score Ring */}
          <div className="py-2">
            <ScoreRing score={idea.score} signalTier={idea.signal} />
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-3.5 pt-4">
            <div>
              <div className="flex justify-between items-center mb-1.5 font-body-sm text-body-sm">
                <span className="text-secondary font-medium">Market Demand &amp; Pull</span>
                <span className="text-on-surface font-semibold font-mono">{idea.metrics.marketDemand}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${idea.metrics.marketDemand}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-body-sm text-body-sm">
                <span className="text-secondary font-medium">Unit Economics &amp; Pricing</span>
                <span className="text-on-surface font-semibold font-mono">{idea.metrics.unitEconomics}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${idea.metrics.unitEconomics}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-body-sm text-body-sm">
                <span className="text-secondary font-medium">Technical Feasibility</span>
                <span className="text-on-surface font-semibold font-mono">{idea.metrics.technicalFeasibility}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${idea.metrics.technicalFeasibility}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20 mt-6">
            <Link
              to={`/ideas/${idea.id}/validation`}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md font-medium text-on-surface transition-colors"
            >
              <span>View Full 5-Agent Report</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* CARD 2: EXECUTIVE SUMMARY & STRATEGIC MOVE (7 COLS) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  flag
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Recommended Move for Sprint 2
                </h3>
              </div>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Pre-Seed Milestone
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface mt-4 leading-relaxed">
              Your market demand index ({idea.metrics.marketDemand}%) proves solid buyer appetite for{' '}
              <strong className="text-on-surface font-semibold">{idea.title}</strong>. However, the{' '}
              <strong className="text-amber-800 font-semibold">
                {idea.agents.find((a) => a.status === 'flagged')?.name || 'Skeptic'} flagged {idea.risks[0]?.title || 'Day-30 drop-off'}
              </strong>{' '}
              as your critical risk. Focus your energy this sprint on locking candidate{' '}
              <strong className="text-on-surface font-semibold">
                {candidates[0]?.name || 'Lead Architect'} ({candidates[0]?.role || idea.roles[0]?.title}, {candidates[0]?.matchScore || 94}% match)
              </strong>{' '}
              to finalize your {idea.plan.milestones[0]?.title || 'core engine'}.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
                warning
              </span>
              <div>
                <h4 className="font-label-md text-label-md font-semibold text-amber-900">
                  Pre-Mortem Vulnerability: {idea.risks[0]?.title || 'Customer Drop-Off'}
                </h4>
                <p className="font-body-sm text-body-sm text-amber-900/80 mt-0.5">
                  {idea.risks[0]?.description || 'Users drop off if initial friction is high.'}{' '}
                  Counter this: {idea.risks[0]?.mitigation || 'Implement automated zero-click ingestion.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                to={`/ideas/${idea.id}/roles`}
                className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>Review Candidates (6)</span>
              </Link>
              <Link
                to={`/ideas/${idea.id}/revenue`}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>Unit Economics &amp; Pricing</span>
              </Link>
              <Link
                to={`/ideas/${idea.id}/competitors`}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">radar</span>
                <span>Competitor Moat</span>
              </Link>
            </div>
          </div>

          {/* UNIT ECONOMICS KPI MINI-GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="LTV:CAC Ratio"
              value={`${idea.revenue.ltvCacRatio}x`}
              subtitle="Target: >3.0x"
              trend={{ value: '+0.4x', isPositive: true }}
              icon="balance"
            />
            <StatCard
              title="Estimated LTV"
              value={`$${idea.revenue.ltv.toFixed(0)}`}
              subtitle="8.2 mos lifetime"
              trend={{ value: '+$14.20', isPositive: true }}
              icon="monetization_on"
            />
            <StatCard
              title="Payback Period"
              value={`${idea.revenue.paybackMonths} mo`}
              subtitle="Cohort recovery"
              trend={{ value: '-0.3 mo', isPositive: true }}
              icon="timer"
            />
          </div>
        </div>

        {/* CARD 3: 5 VALIDATION AGENTS OVERVIEW (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                neurology
              </span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                5 AI Agents Status
              </h3>
            </div>
            <Link
              to={`/ideas/${idea.id}/validation`}
              className="font-label-sm text-label-sm text-primary-container hover:underline font-medium"
            >
              Full Agent Breakdown →
            </Link>
          </div>

          <div className="space-y-3">
            {idea.agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container shrink-0">
                    <span className="material-symbols-outlined text-[17px]">{agent.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline-sm text-[13px] font-semibold text-on-surface truncate">
                      {agent.name}
                    </div>
                    <div className="font-body-sm text-[11px] text-secondary truncate">
                      {agent.verdict}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <span className="font-mono text-xs font-semibold text-on-surface">
                    {agent.score}/100
                  </span>
                  <span
                    className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      agent.status === 'flagged'
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'bg-primary-fixed/40 text-primary-container'
                    }`}
                  >
                    {agent.status === 'flagged' ? 'Vulnerable' : 'Strong'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: TOP MATCHED CANDIDATES (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                groups
              </span>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Matched Talent Pipeline
              </h3>
            </div>
            <Link
              to={`/ideas/${idea.id}/roles`}
              className="font-label-sm text-label-sm text-primary-container hover:underline font-medium"
            >
              View All 6 Matches →
            </Link>
          </div>

          <div className="space-y-3.5">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20 flex items-center justify-between hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cand.avatar}
                    alt={cand.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-outline-variant/30"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-[13px] font-semibold text-on-surface truncate">
                        {cand.name}
                      </span>
                      <span className="font-label-sm text-[10px] text-secondary">
                        {cand.currentCompany}
                      </span>
                    </div>
                    <div className="font-body-sm text-[11px] text-secondary truncate">
                      {cand.role}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cand.skills.slice(0, 3).map((s, idx) => (
                        <SkillChip key={idx} name={s.name} matched={s.matched} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <MatchRing percentage={cand.matchScore} size={42} strokeWidth={4} />
                  <Link
                    to={`/ideas/${idea.id}/roles`}
                    className="p-1.5 rounded-lg bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-on-primary transition-colors"
                    title="Initiate outreach"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-body-sm text-xs text-secondary">
              3 engineering roles identified from AI system plan
            </span>
            <Link
              to={`/ideas/${idea.id}/outreach`}
              className="font-label-sm text-label-sm text-primary-container font-medium hover:underline flex items-center gap-1"
            >
              <span>Outreach Kanban</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
