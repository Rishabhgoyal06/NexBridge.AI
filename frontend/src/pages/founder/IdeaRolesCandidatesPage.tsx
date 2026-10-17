import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { useAuth } from '@/context/AuthContext';
import { ideaService } from '@/services/ideaService';
import { outreachService } from '@/services/outreachService';
import { Idea, Candidate, JobRole } from '@/types';
import { MatchRing } from '@/components/shared/MatchRing';
import { SkillChip } from '@/components/shared/SkillChip';
import { SlideOver } from '@/components/shared/SlideOver';

export const IdeaRolesCandidatesPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [outreachCandidate, setOutreachCandidate] = useState<Candidate | null>(null);
  const [outreachSubject, setOutreachSubject] = useState('');
  const [outreachBody, setOutreachBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  usePageContext({
    pageKey: 'idea_roles_candidates',
    title: 'Required Roles & Talent Candidates — NutriFit AI',
    summary: 'Team assembly matching: 3 essential roles identified from tech stack, 6 matched candidates from the talent database with match percentages and skill gap breakdowns.',
    data: { candidateCount: candidates.length, rolesCount: idea?.roles?.length },
  });

  useEffect(() => {
    async function load() {
      if (id) {
        const found = await ideaService.getIdeaById(id);
        setIdea(found);
        const cList = await outreachService.getCandidates();
        setCandidates(cList);
      }
    }
    load();
  }, [id]);

  const handleOpenOutreach = (cand: Candidate) => {
    setOutreachCandidate(cand);
    setOutreachSubject(`${cand.role} role at NutriFit AI (${cand.matchScore}% AI Match • Pre-Seed)`);
    setOutreachBody(
      `Hi ${cand.name},\n\nI came across your profile on NexBridge and was impressed by your track record at ${cand.currentCompany}.\n\nWe are building NutriFit AI to automate nutritional carb-cycling for strength athletes with 1-click grocery fulfillment. Our AI technical architect flagged your experience in ${cand.skills.filter((s) => s.matched).map((s) => s.name).slice(0, 3).join(', ')} as an exceptional match for our team.\n\nWould you be open to a 20-minute intro call this week to review our architecture and equity allocation?\n\nBest,\n${user?.name || 'Aarav Patel'}\nFounder, NutriFit AI`
    );
    setSentSuccess(false);
  };

  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachCandidate) return;

    setIsSending(true);
    try {
      await outreachService.sendOutreach(outreachCandidate.id, outreachSubject, outreachBody);
      setSentSuccess(true);
      // Update candidate in local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === outreachCandidate.id ? { ...c, outreachStatus: 'contacted' } : c
        )
      );
      setTimeout(() => {
        setOutreachCandidate(null);
        setSentSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (!idea) return null;

  const filteredCandidates =
    selectedRole === 'all'
      ? candidates
      : candidates.filter((c) => c.appliedJobRoleId === selectedRole);

  return (
    <div className="space-y-8">
      {/* 1. Required Engineering Roles (From AI Plan) */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              work
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Synthesized Founding Roles (3 Open)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedRole === 'all'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container text-secondary hover:text-on-surface'
              }`}
            >
              All Roles ({candidates.length})
            </button>
            {idea.roles.map((role: JobRole) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedRole === role.id
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container text-secondary hover:text-on-surface'
                }`}
              >
                {role.title.split('/')[0]} ({role.candidateMatchesCount})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {idea.roles.map((r: JobRole) => (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedRole === r.id
                  ? 'bg-primary-fixed/20 border-primary-container/60 ring-2 ring-primary-fixed shadow-xs'
                  : 'bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-secondary">
                  {r.department} • {r.type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-medium text-secondary">
                  {r.urgency}
                </span>
              </div>

              <h4 className="font-headline-sm text-sm font-semibold text-on-surface mb-2">
                {r.title}
              </h4>

              <div className="flex flex-wrap gap-1 mb-3">
                {r.requiredSkills.map((sk: string, idx: number) => (
                  <span
                    key={idx}
                    className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-secondary"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-secondary pt-2 border-t border-outline-variant/20">
                <span>{r.candidateMatchesCount} Verified Matches</span>
                <span className="text-primary-container font-medium hover:underline">
                  Filter Candidates →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Matched Candidates List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Matched Co-Founders &amp; Engineers ({filteredCandidates.length})
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Profiles parsed from the talent database with AI skill alignment and prior startup trajectory.
            </p>
          </div>
          <Link
            to={`/ideas/${idea.id}/outreach`}
            className="font-label-md text-label-md text-primary-container hover:underline font-medium flex items-center gap-1"
          >
            <span>View Outreach Pipeline Kanban</span>
            <span className="material-symbols-outlined text-[16px]">view_kanban</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/20 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.avatar}
                      alt={cand.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/20"
                    />
                    <div>
                      <h4 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                        {cand.name}
                      </h4>
                      <p className="font-body-sm text-xs text-secondary mt-0.5">
                        {cand.role} • {cand.currentCompany}
                      </p>
                      <div className="font-body-sm text-[11px] text-outline mt-0.5">
                        {cand.location} • {cand.experienceYears}y experience
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <MatchRing percentage={cand.matchScore} size={48} strokeWidth={5} />
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-secondary mt-1">
                      Match Fit
                    </span>
                  </div>
                </div>

                <p className="font-body-sm text-xs text-on-surface leading-relaxed mb-4">
                  {cand.bio}
                </p>

                {/* Skills Match List */}
                <div className="space-y-1.5 mb-4">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-medium block">
                    Skill Alignment
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.map((sk, idx) => (
                      <SkillChip key={idx} name={sk.name} matched={sk.matched} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <a
                    href={cand.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-on-surface transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">code</span>
                    GitHub
                  </a>
                  <span>•</span>
                  <a
                    href={cand.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-on-surface transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">link</span>
                    LinkedIn
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {cand.outreachStatus === 'contacted' ? (
                    <span className="px-3 py-1 rounded-lg bg-surface-container text-primary-container font-label-md text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Outreach Sent
                    </span>
                  ) : cand.outreachStatus === 'interviewing' ? (
                    <span className="px-3 py-1 rounded-lg bg-primary-fixed/40 text-primary-container font-label-md text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">forum</span>
                      Interviewing
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenOutreach(cand)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">send</span>
                      <span>Send Outreach</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach SlideOver Modal */}
      <SlideOver
        isOpen={!!outreachCandidate}
        onClose={() => setOutreachCandidate(null)}
        title={outreachCandidate ? `Outreach to ${outreachCandidate.name}` : 'Compose Outreach'}
        subtitle={outreachCandidate ? `${outreachCandidate.role} • ${outreachCandidate.matchScore}% Match` : ''}
        width="max-w-lg"
      >
        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary-fixed/50 text-primary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">check</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Outreach Dispatched!
            </h4>
            <p className="font-body-sm text-secondary">
              Added to your Outreach Pipeline Kanban under "Sent". Candidate notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendOutreach} className="space-y-4">
            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={outreachSubject}
                onChange={(e) => setOutreachSubject(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Personalized Message (AI Synthesized)
              </label>
              <textarea
                rows={9}
                required
                value={outreachBody}
                onChange={(e) => setOutreachBody(e.target.value)}
                className="w-full p-3.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface leading-relaxed focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low/50 text-xs text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary-container">
                auto_awesome
              </span>
              <span>
                Personalized automatically using Elena’s Strava background &amp; NutriFit’s HealthKit needs.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  <span>Dispatching Message...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Send Founder Invitation</span>
                </>
              )}
            </button>
          </form>
        )}
      </SlideOver>
    </div>
  );
};
