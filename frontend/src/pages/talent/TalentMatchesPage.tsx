import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { talentService } from '@/services/talentService';
import { TalentProfile, StartupMatch } from '@/types';
import { MatchRing } from '@/components/shared/MatchRing';
import { SkillChip } from '@/components/shared/SkillChip';

export const TalentMatchesPage: React.FC = () => {
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [matches, setMatches] = useState<StartupMatch[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});

  usePageContext({
    pageKey: 'talent_matches',
    title: 'Talent Workspace — High-Conviction Startup Matches',
    summary: 'Candidate matching feed: 6 startups aligned with your background in distributed systems, FastAPI, and React Native.',
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
      const updated = await talentService.uploadResume(file.name);
      setProfile(updated);
    } finally {
      setIsUploading(false);
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
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xl ring-4 ring-primary-fixed/30">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-lg font-semibold text-on-surface">
                {profile.name}
              </h2>
              <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-medium">
                Verified Talent
              </span>
            </div>
            <p className="font-body-sm text-xs text-secondary mt-0.5 max-w-xl">
              {profile.headline}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.skills.slice(0, 6).map((sk, idx) => (
                <SkillChip key={idx} name={sk} matched={true} size="sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Upload Resume Button / Status */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium transition-colors border border-outline-variant/30 shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-primary-container">
              upload_file
            </span>
            <span>{isUploading ? 'Parsing with AI...' : 'Re-upload Resume'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
          {profile.resumeFileName && (
            <span className="font-mono text-[11px] text-secondary">
              Active: {profile.resumeFileName}
            </span>
          )}
        </div>
      </div>

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
                      {match.fundingStage}
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

              {/* Compensation */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-surface-container-low/50 mb-4 text-xs font-mono">
                <div>
                  <span className="text-secondary block text-[10px] uppercase">Salary</span>
                  <span className="font-semibold text-on-surface">{match.salaryRange}</span>
                </div>
                <div>
                  <span className="text-secondary block text-[10px] uppercase">Equity</span>
                  <span className="font-semibold text-on-surface">{match.equityRange}</span>
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

            {/* Application Action */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs text-secondary">Pre-screened fit</span>

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
    </div>
  );
};
