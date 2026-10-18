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
import { formatSalaryRupees } from '@/lib/currency';

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

  // Role Configuration Drawer State
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDept, setRoleDept] = useState('Engineering');
  const [roleType, setRoleType] = useState('Co-Founder');
  const [roleUrgency, setRoleUrgency] = useState('Immediate / Day 1');
  const [roleSalary, setRoleSalary] = useState('₹28L - ₹42L / yr');
  const [roleEquity, setRoleEquity] = useState('5.0% - 10.0%');
  const [roleRationale, setRoleRationale] = useState('');
  const [roleDemandIndex, setRoleDemandIndex] = useState(88);
  const [roleSkillsInput, setRoleSkillsInput] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);

  usePageContext({
    pageKey: 'idea_roles_candidates',
    title: `Required Roles & Talent Candidates — ${idea?.title || 'Concept'}`,
    summary: idea ? `Team assembly matching: ${idea.roles?.length || 3} essential roles identified, ${candidates.length} matched candidates with skill gap breakdowns.` : 'Team assembly matching',
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

  const handleOpenEditRole = (role?: JobRole) => {
    if (role) {
      setEditingRoleId(role.id);
      setRoleTitle(role.title);
      setRoleDept(role.department);
      setRoleType(role.type);
      setRoleUrgency(role.urgency);
      setRoleSalary(role.salaryRange || '₹28L - ₹42L / yr');
      setRoleEquity(role.equityRange || '5.0% - 10.0%');
      setRoleRationale(role.marketRationale || `Critical talent driver for ${idea?.title || 'venture'} architecture and core development.`);
      setRoleDemandIndex(role.marketDemandIndex || 88);
      setRoleSkillsInput(role.requiredSkills.join(', '));
    } else {
      setEditingRoleId(null);
      setRoleTitle('');
      setRoleDept('Engineering');
      setRoleType('Co-Founder');
      setRoleUrgency('Immediate / Day 1');
      setRoleSalary('₹28L - ₹42L / yr');
      setRoleEquity('5.0% - 10.0%');
      setRoleRationale(`High-priority talent requirement for ${idea?.title || 'venture'} execution.`);
      setRoleDemandIndex(85);
      setRoleSkillsInput('Python, React, TypeScript');
    }
    setIsRoleDrawerOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !roleTitle.trim()) return;

    setIsSavingRole(true);
    try {
      const parsedSkills = roleSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      let updatedRoles: JobRole[] = [];
      if (editingRoleId) {
        updatedRoles = idea.roles.map((r) =>
          r.id === editingRoleId
            ? {
                ...r,
                title: roleTitle.trim(),
                department: roleDept,
                type: roleType,
                urgency: roleUrgency,
                salaryRange: roleSalary.trim(),
                equityRange: roleEquity.trim(),
                marketRationale: roleRationale.trim(),
                marketDemandIndex: Number(roleDemandIndex) || 85,
                requiredSkills: parsedSkills,
              }
            : r
        );
      } else {
        const newRole: JobRole = {
          id: `role_${Date.now()}`,
          title: roleTitle.trim(),
          department: roleDept,
          type: roleType,
          urgency: roleUrgency,
          requiredSkills: parsedSkills,
          preferredSkills: [],
          candidateMatchesCount: 3,
          salaryRange: roleSalary.trim(),
          equityRange: roleEquity.trim(),
          marketRationale: roleRationale.trim(),
          marketDemandIndex: Number(roleDemandIndex) || 85,
        };
        updatedRoles = [...idea.roles, newRole];
      }

      await ideaService.updateIdeaRoles(idea.id, updatedRoles);
      setIdea({ ...idea, roles: updatedRoles });
      setIsRoleDrawerOpen(false);
    } catch (err) {
      console.error('Failed to save role:', err);
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleOpenOutreach = (cand: Candidate) => {
    const ideaName = idea?.title || 'our venture';
    setOutreachCandidate(cand);
    setOutreachSubject(`${cand.role} role at ${ideaName} (${cand.matchScore}% AI Match • Pre-Seed)`);
    setOutreachBody(
      `Hi ${cand.name},\n\nI came across your profile on NexBridge and was impressed by your track record at ${cand.currentCompany}.\n\nWe are building ${ideaName} (${idea?.tagline || idea?.description || 'an innovative AI platform'}). Our team flagged your experience in ${cand.skills.filter((s) => s.matched).map((s) => s.name).slice(0, 3).join(', ')} as an exceptional match for our founding team.\n\nWould you be open to a 20-minute intro call this week to review our architecture and equity allocation?\n\nBest,\n${user?.name || 'Founder'}\nFounder, ${ideaName}`
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
      {/* 1. Required Engineering Roles with Market Talent Intelligence */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">
              work
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Synthesized Founding Roles ({idea.roles.length} Configured)
              </h3>
              <p className="font-body-sm text-xs text-secondary">
                AI market talent benchmarks, scarcity index, and competitive hiring compensation in ₹.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/ideas/${idea.id}/market`}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">insights</span>
              <span>Market Intel &amp; Demand</span>
            </Link>
            <button
              onClick={() => handleOpenEditRole()}
              className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>+ Add Founding Role</span>
            </button>
            <div className="h-4 w-px bg-outline-variant/40" />
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {idea.roles.map((r: JobRole) => (
            <div
              key={r.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                selectedRole === r.id
                  ? 'bg-primary-fixed/20 border-primary-container/60 ring-2 ring-primary-fixed shadow-xs'
                  : 'bg-surface-container-low/40 border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold text-secondary">
                    {r.department} • {r.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-medium text-secondary">
                    {r.urgency}
                  </span>
                </div>

                <h4 className="font-headline-sm text-sm font-semibold text-on-surface mb-3">
                  {r.title}
                </h4>

                {/* Market Talent Intelligence Card */}
                <div className="bg-surface-container-lowest/80 rounded-lg p-3 border border-outline-variant/30 space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Market Benchmark:</span>
                    <span className="font-semibold text-on-surface">{formatSalaryRupees(r.salaryRange)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Target Equity:</span>
                    <span className="font-semibold text-primary-container">{r.equityRange || '4.0% - 8.0%'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Market Scarcity:</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {r.marketDemandIndex || 88}% Scarcity Index
                    </span>
                  </div>
                  {r.marketRationale && (
                    <p className="text-[11px] text-secondary leading-relaxed pt-1.5 border-t border-outline-variant/20 italic">
                      &ldquo;{r.marketRationale}&rdquo;
                    </p>
                  )}
                </div>

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
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEditRole(r)}
                  className="font-medium text-secondary hover:text-on-surface flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>Configure Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className="text-primary-container font-medium hover:underline cursor-pointer"
                >
                  {r.candidateMatchesCount} Matches →
                </button>
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
                Personalized automatically using {outreachCandidate?.name ? outreachCandidate.name.split(' ')[0] : 'Candidate'}&rsquo;s background &amp; {idea?.title || 'Venture'}&rsquo;s technical stack.
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

      {/* Role Configuration SlideOver Drawer */}
      <SlideOver
        isOpen={isRoleDrawerOpen}
        onClose={() => setIsRoleDrawerOpen(false)}
        title={editingRoleId ? 'Configure Founding Role' : 'Add Founding Role'}
        subtitle={`Tailor talent requirements & market compensation in ₹ for ${idea.title}`}
        width="max-w-lg"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Role Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CTO / Founding AI Architect"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={roleDept}
                onChange={(e) => setRoleDept(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="GTM / Growth">GTM / Growth</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Role Type
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Co-Founder">Co-Founder</option>
                <option value="Founding Team">Founding Team</option>
                <option value="Senior Lead">Senior Lead</option>
                <option value="Staff Specialist">Staff Specialist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Hiring Urgency
              </label>
              <select
                value={roleUrgency}
                onChange={(e) => setRoleUrgency(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Immediate / Day 1">Immediate / Day 1</option>
                <option value="Post-Seed">Post-Seed</option>
                <option value="Series A Scaling">Series A Scaling</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Market Scarcity Index (%)
              </label>
              <input
                type="number"
                min={50}
                max={99}
                value={roleDemandIndex}
                onChange={(e) => setRoleDemandIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Market Benchmark Salary (₹)
              </label>
              <input
                type="text"
                required
                placeholder="₹28L - ₹42L / yr"
                value={roleSalary}
                onChange={(e) => setRoleSalary(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            <div>
              <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                Equity Allocation
              </label>
              <input
                type="text"
                required
                placeholder="5.0% - 10.0%"
                value={roleEquity}
                onChange={(e) => setRoleEquity(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Required Skills (Comma-separated)
            </label>
            <input
              type="text"
              required
              placeholder="Python, FastAPI, PyTorch, Distributed Systems"
              value={roleSkillsInput}
              onChange={(e) => setRoleSkillsInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Market Hiring Rationale &amp; Strategy
            </label>
            <textarea
              rows={3}
              required
              placeholder="Why this role is essential and what competitive advantage they unlock..."
              value={roleRationale}
              onChange={(e) => setRoleRationale(e.target.value)}
              className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface leading-relaxed focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingRole}
              className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSavingRole ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  <span>Saving Role Configuration...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{editingRoleId ? 'Update Role Configuration' : 'Save New Founding Role'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
};
