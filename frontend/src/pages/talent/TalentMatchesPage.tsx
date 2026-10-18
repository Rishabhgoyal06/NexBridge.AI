import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { talentService } from '@/services/talentService';
import { TalentProfile, StartupMatch } from '@/types';
import { MatchRing } from '@/components/shared/MatchRing';
import { SkillChip } from '@/components/shared/SkillChip';
import { SlideOver } from '@/components/shared/SlideOver';
import { AgentRow } from '@/components/shared/AgentRow';
import { formatSalaryRupees, formatFundingRupees } from '@/lib/currency';

export const TalentMatchesPage: React.FC = () => {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [matches, setMatches] = useState<StartupMatch[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
  const [selectedIntelMatch, setSelectedIntelMatch] = useState<StartupMatch | null>(null);

  usePageContext({
    pageKey: 'talent_matches',
    title: 'Talent Workspace — High-Conviction Startup Matches',
    summary: 'Candidate matching feed: startups aligned with your background in software architecture and modern engineering.',
    data: { matchesCount: matches.length },
  });

  useEffect(() => {
    async function load() {
      const p = await talentService.getProfile();
      setProfile(p);
      const m = await talentService.getStartupMatches();
      setMatches(m);
    }
    load();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const updated = await talentService.uploadResume(file.name, file);
      setProfile(updated);
      const m = await talentService.getStartupMatches();
      setMatches(m);
    } catch (err) {
      console.error('Failed to upload and parse resume:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleApply = (matchId: string) => {
    setAppliedMap((prev) => ({ ...prev, [matchId]: true }));
  };

  if (!profile) return null;

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-8">
      {/* Talent Profile Card & Resume Uploader */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xl ring-4 ring-primary-fixed/30 shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-lg font-semibold text-on-surface">
                {profile.name}
              </h2>
              <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-medium">
                Verified Co-Builder
              </span>
            </div>
            <p className="font-body-sm text-xs text-secondary mt-0.5 max-w-xl">
              {profile.headline}
            </p>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.slice(0, 8).map((sk, idx) => (
                  <SkillChip key={idx} name={sk} matched={true} size="sm" />
                ))}
                {profile.skills.length > 8 && (
                  <span className="text-[11px] text-secondary self-center px-1 font-mono">
                    +{profile.skills.length - 8} more
                  </span>
                )}
              </div>
            ) : (
              <p className="font-mono text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Upload your resume above to extract skills and activate AI Agent vetting.
              </p>
            )}
          </div>
        </div>

        {/* Upload Resume Button / Status */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium transition-colors border border-outline-variant/30 shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-primary-container">
              upload_file
            </span>
            <span>{isUploading ? 'Parsing with AI...' : 'Upload Resume'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
          {profile.resumeFileName && (
            <span className="font-mono text-[11px] text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
              Active: {profile.resumeFileName}
            </span>
          )}
        </div>
      </div>

      {/* Uploading In-Progress Feedback */}
      {isUploading && (
        <div className="bg-primary-fixed/20 border border-primary-container/30 rounded-xl p-6 shadow-sm flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full border-3 border-primary-container border-t-transparent animate-spin shrink-0"></div>
          <div className="space-y-1">
            <h4 className="font-headline-sm text-sm font-semibold text-on-surface flex items-center gap-2">
              <span>Autonomous Multi-Agent Pipeline Running</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary-container text-on-primary">AI Vetting</span>
            </h4>
            <p className="font-body-sm text-xs text-secondary">
              Extracting candidate profile from resume, indexing verified technical skills into pgvector, and orchestrating 4 autonomous evaluation agents...
            </p>
          </div>
        </div>
      )}

      {/* Autonomous AI Agent Vetting & Assessment */}
      {profile.agents && profile.agents.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                    Autonomous AI Agent Vetting &amp; Assessment
                  </h3>
                  <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    4 / 4 Agents Completed
                  </span>
                </div>
                <p className="font-body-sm text-xs text-secondary mt-0.5">
                  Deep multi-agent evaluation derived from your uploaded resume ({profile.resumeFileName || 'Active Resume'}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
              <span className="text-secondary">Composite Readiness:</span>
              <span className="px-3 py-1 rounded-lg bg-primary-container text-on-primary font-bold text-sm">
                {Math.round(profile.agents.reduce((acc, a) => acc + a.score, 0) / profile.agents.length)}/100
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {profile.agents.map((agent, index) => (
              <AgentRow
                key={agent.id || index}
                agent={agent}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header with Navigation Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            AI-Matched Ventures ({matches.length})
          </h3>
          <p className="font-body-sm text-body-sm text-secondary">
            Startups seeking your verified skill set with competitive equity &amp; salary bands.
          </p>
        </div>

        <Link
          to="/talent/applications"
          className="font-label-md text-label-md text-primary-container hover:underline font-medium flex items-center gap-1"
        >
          <span>View My Applications (5)</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/20 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline-sm text-base font-semibold text-on-surface">
                      {match.startupName}
                    </h4>
                    <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                      {formatFundingRupees(match.fundingStage)}
                    </span>
                  </div>
                  <div className="font-headline-sm text-sm font-medium text-primary-container mt-0.5">
                    {match.role}
                  </div>
                  <div className="font-body-sm text-xs text-secondary mt-0.5">
                    {match.location} • Founder: {match.founderName}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <MatchRing percentage={match.matchPercentage} size={48} strokeWidth={5} />
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-secondary mt-1">
                    Match
                  </span>
                </div>
              </div>

              <p className="font-body-sm text-xs text-on-surface leading-relaxed mb-4">
                {match.companyBio}
              </p>

              {/* Compensation in Indian Rupees */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-container-low/50 mb-4 text-xs font-mono">
                <div>
                  <span className="text-secondary block text-[10px] uppercase">Market Salary</span>
                  <span className="font-semibold text-on-surface">{formatSalaryRupees(match.salaryRange)}</span>
                </div>
                <div>
                  <span className="text-secondary block text-[10px] uppercase">Target Equity</span>
                  <span className="font-semibold text-primary-container">{match.equityRange}</span>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary block mb-1">
                    Matched Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.keySkillsMatched.map((s, idx) => (
                      <SkillChip key={idx} name={s} matched={true} size="sm" />
                    ))}
                  </div>
                </div>

                {match.missingSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                      Skill Gaps (Can grow into)
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {match.missingSkills.map((s, idx) => (
                        <SkillChip key={idx} name={s} matched={false} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application & Intel Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedIntelMatch(match)}
                className="text-xs font-medium text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">analytics</span>
                <span>Venture Market Intel</span>
              </button>

              {appliedMap[match.id] ? (
                <span className="px-4 py-1.5 rounded-lg bg-surface-container text-primary-container font-label-md text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Applied
                </span>
              ) : (
                <button
                  onClick={() => handleApply(match.id)}
                  className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  <span>1-Click Apply</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Venture Intel & Market Analysis SlideOver Drawer */}
      <SlideOver
        isOpen={!!selectedIntelMatch}
        onClose={() => setSelectedIntelMatch(null)}
        title={selectedIntelMatch ? `Venture Intel: ${selectedIntelMatch.startupName}` : 'Venture Intel'}
        subtitle={selectedIntelMatch ? `${selectedIntelMatch.role} • ${formatFundingRupees(selectedIntelMatch.fundingStage)}` : ''}
        width="max-w-lg"
      >
        {selectedIntelMatch && (
          <div className="space-y-5 text-xs text-on-surface">
            {/* Header Score Card */}
            <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  AI Validation Conviction
                </span>
                <span className="text-2xl font-bold font-headline-sm text-on-surface">
                  {selectedIntelMatch.matchPercentage}% Alignment
                </span>
                <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                  High-Conviction Commercial Signal
                </span>
              </div>
              <MatchRing percentage={selectedIntelMatch.matchPercentage} size={54} strokeWidth={6} />
            </div>

            {/* Target Persona & Problem */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-primary-container">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                <span className="text-xs uppercase tracking-wider">Target Persona &amp; Urgent Problem</span>
              </div>
              <p className="text-secondary leading-relaxed">
                Customers in this vertical spend 8-12 hours per week wrestling with disjointed legacy workflows. 
                {selectedIntelMatch.startupName} automates these mission-critical tasks with real-time AI assistance, driving immediate measurable ROI.
              </p>
            </div>

            {/* Market Opportunity & Sizing */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-primary-container">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="text-xs uppercase tracking-wider">Market Dynamics &amp; TAM</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Addressable TAM</span>
                  <span className="font-semibold text-on-surface">₹18,500 Cr ($2.2B)</span>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Segment CAGR</span>
                  <span className="font-semibold text-emerald-600">+24.5% YoY</span>
                </div>
              </div>
              <p className="text-secondary text-[11px] leading-relaxed pt-1">
                Tailwinds driven by rapid cloud migration, remote operating infrastructure, and AI workflow automation.
              </p>
            </div>

            {/* Unit Economics & Compensation */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-primary-container">
                <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                <span className="text-xs uppercase tracking-wider">Unit Economics &amp; Compensation</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Benchmark Salary</span>
                  <span className="font-semibold text-on-surface">{formatSalaryRupees(selectedIntelMatch.salaryRange)}</span>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Equity Pool</span>
                  <span className="font-semibold text-primary-container">{selectedIntelMatch.equityRange}</span>
                </div>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed pt-1">
                Target SaaS pricing is structured in ₹ with healthy 74%+ gross software margins and a 3.4-month payback period.
              </p>
            </div>

            {/* Technical Feasibility & Moat */}
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-primary-container">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span className="text-xs uppercase tracking-wider">Architecture &amp; Defensibility</span>
              </div>
              <p className="text-secondary leading-relaxed">
                Powered by async microservices, PostgreSQL with vector indexing, and low-latency pipeline orchestration. 
                Your role as <span className="font-semibold text-on-surface">{selectedIntelMatch.role}</span> is positioned as the core technical anchor.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2">
              {appliedMap[selectedIntelMatch.id] ? (
                <div className="w-full py-2.5 rounded-lg bg-surface-container text-primary-container text-center font-medium">
                  ✓ Application Dispatched to Founder ({selectedIntelMatch.founderName})
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleApply(selectedIntelMatch.id);
                    setSelectedIntelMatch(null);
                  }}
                  className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Apply with AI Matched Profile</span>
                </button>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
};
