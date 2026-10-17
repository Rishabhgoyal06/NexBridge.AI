import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { talentService } from '@/services/talentService';
import { Application } from '@/types';
import { MatchRing } from '@/components/shared/MatchRing';

export const ApplicationsTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  usePageContext({
    pageKey: 'applications_tracker',
    title: 'Applications Tracker — Talent Workspace',
    summary: 'Candidate applications tracker: 5 submissions. 1 Offer, 1 Interviewing, 1 Under Review, and 2 Rejected with full Rejection Growth Reports.',
    data: { applicationsCount: applications.length },
  });

  useEffect(() => {
    async function load() {
      const apps = await talentService.getApplications();
      setApplications(apps);
    }
    load();
  }, []);

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Offer':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-xs font-semibold">
            Offer Extended
          </span>
        );
      case 'Interviewing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary-container font-label-sm text-xs font-semibold">
            Interviewing
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-label-sm text-xs font-semibold">
            Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-xs font-semibold">
            Rejection with Growth Report
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            My Startup Applications ({applications.length})
          </h2>
          <p className="font-body-sm text-body-sm text-secondary">
            Real-time status tracking for venture co-builder and engineering applications.
          </p>
        </div>

        <Link
          to="/talent/matches"
          className="font-label-md text-xs font-medium px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span>Find More Matches</span>
        </Link>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden divide-y divide-outline-variant/20">
        {applications.map((app) => (
          <div
            key={app.id}
            className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low/30 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <MatchRing percentage={app.matchPercentage} size={46} strokeWidth={4} />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-headline-sm text-base font-semibold text-on-surface truncate">
                    {app.companyName}
                  </h4>
                  {getStatusBadge(app.status)}
                </div>
                <div className="font-headline-sm text-sm font-medium text-primary-container mt-0.5">
                  {app.role}
                </div>
                <div className="font-body-sm text-xs text-secondary mt-0.5">
                  Applied {app.appliedDate} • {app.stageInfo}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              {app.hasReport ? (
                <Link
                  to={`/talent/applications/${app.id}/report`}
                  className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>View Growth Report</span>
                </Link>
              ) : app.status === 'Offer' ? (
                <button
                  onClick={() => alert('Reviewing Offer Package')}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Review Offer</span>
                </button>
              ) : (
                <span className="text-xs text-secondary font-mono">In Progress</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
