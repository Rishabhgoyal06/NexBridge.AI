import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { useAuth } from '@/context/AuthContext';
import { mentorService } from '@/services/mentorService';
import { MentorRequest } from '@/types';

export const MentorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Mentor';

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  usePageContext({
    pageKey: 'mentor_dashboard',
    title: `Mentor Dashboard — ${user?.name || 'Advisor Workspace'}`,
    summary: `Advisory workspace: ${pendingCount} pending requests, ${acceptedCount} confirmed sessions.`,
    data: { pendingCount, acceptedCount },
  });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await mentorService.getRequests();
        setRequests(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdateStatus = async (reqId: string, status: 'accepted' | 'declined' | 'completed') => {
    const updated = await mentorService.updateRequestStatus(reqId, status);
    setRequests([...updated]);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
          <span className="font-body-md text-secondary">Loading advisory workspace...</span>
        </div>
      </div>
    );
  }

  const recentRequests = requests.slice(0, 3);

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-headline-xl text-headline-xl tracking-tight text-on-surface font-semibold">
              Welcome back, {displayName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-sm text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Advisor Workspace
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Manage your incoming founder consultation requests and active advisory sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/mentor/requests"
            className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>View All Requests</span>
          </Link>
        </div>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: pendingCount, icon: 'hourglass_empty', color: 'bg-amber-100 text-amber-800' },
          { label: 'Confirmed Sessions', value: acceptedCount, icon: 'event_available', color: 'bg-primary-fixed/30 text-primary-container' },
          { label: 'Completed Sessions', value: completedCount, icon: 'task_alt', color: 'bg-emerald-100 text-emerald-800' },
          { label: 'Founders Helped', value: requests.length, icon: 'groups', color: 'bg-surface-container text-on-surface' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-sm flex flex-col gap-2"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
            </div>
            <div className="font-mono text-2xl font-bold text-on-surface">{stat.value}</div>
            <div className="font-body-sm text-xs text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Recent Session Requests
          </h2>
          <Link
            to="/mentor/requests"
            className="font-label-md text-xs text-primary-container hover:underline font-medium flex items-center gap-1"
          >
            <span>View all ({requests.length})</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-12 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">calendar_month</span>
            <h3 className="font-headline-sm text-base font-semibold text-on-surface">No requests yet</h3>
            <p className="font-body-sm text-xs text-secondary max-w-sm">
              Founders browsing the advisor directory will send you session requests here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary-container flex items-center justify-center font-bold text-base">
                      {req.founderName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-sm font-semibold text-on-surface">
                          {req.founderName}
                        </span>
                        <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                          {req.startupName}
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-primary-container font-medium mt-0.5">
                        {req.topic}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-label-sm text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      req.status === 'accepted'
                        ? 'bg-primary-fixed/40 text-primary-container'
                        : req.status === 'declined'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {req.status === 'accepted'
                      ? 'Confirmed'
                      : req.status === 'declined'
                      ? 'Declined'
                      : 'Pending'}
                  </span>
                </div>

                <p className="font-body-sm text-xs text-secondary leading-relaxed bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/20 mb-3 line-clamp-2">
                  "{req.message}"
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary-container">schedule</span>
                    {req.proposedTime}
                  </span>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'declined')}
                        className="px-3 py-1 rounded-lg border border-outline-variant/40 hover:bg-surface-container font-label-md text-xs font-medium text-secondary hover:text-on-surface transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                        className="px-3 py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>Accept</span>
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <span className="text-xs text-primary-container font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">videocam</span>
                      Google Meet Dispatched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Profile Quick-link */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="font-headline-sm text-sm font-semibold text-on-surface">{user?.name}</div>
            <div className="font-body-sm text-xs text-secondary">{user?.headline || 'Verified Advisor'}</div>
            <div className="font-body-sm text-xs text-primary-container font-medium mt-0.5">
              {user?.company || 'Advisory Network'}
            </div>
          </div>
        </div>
        <Link
          to="/mentor/profile"
          className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
          <span>Edit My Public Profile</span>
        </Link>
      </section>
    </div>
  );
};
