import React, { useEffect, useState } from 'react';
import { usePageContext } from '@/context/PageContext';
import { mentorService } from '@/services/mentorService';
import { MentorRequest } from '@/types';

export const MentorRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<MentorRequest[]>([]);

  usePageContext({
    pageKey: 'mentor_requests',
    title: 'Advisory Session Requests — Mentor Workspace',
    summary: 'Manage inbound founder consultation requests, review proposed topics, and accept calendar holds.',
    data: { requestsCount: requests.length },
  });

  useEffect(() => {
    async function load() {
      const list = await mentorService.getRequests();
      setRequests(list);
    }
    load();
  }, []);

  const handleUpdateStatus = async (
    reqId: string,
    status: 'accepted' | 'declined' | 'completed'
  ) => {
    const updated = await mentorService.updateRequestStatus(reqId, status);
    setRequests([...updated]);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Mentor Operations
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">
              Inbound Requests
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Founder Session Requests ({requests.length})
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Review context from validated startup ideas and accept advisory bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-secondary font-medium">
            2 Upcoming This Week
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary-container flex items-center justify-center font-bold">
                  {req.founderName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                      {req.founderName}
                    </h3>
                    <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                      {req.startupName}
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-primary-container font-medium mt-0.5">
                    {req.topic}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                    : 'Pending Confirmation'}
                </span>
              </div>
            </div>

            <p className="font-body-sm text-xs text-on-surface leading-relaxed bg-surface-container-low/40 p-3.5 rounded-lg border border-outline-variant/20">
              "{req.message}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  schedule
                </span>
                <span>Proposed: {req.proposedTime}</span>
              </div>

              <div className="flex items-center gap-2">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'declined')}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container font-label-md text-xs font-medium text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'accepted')}
                      className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span>
                      <span>Accept Session</span>
                    </button>
                  </>
                )}
                {req.status === 'accepted' && (
                  <span className="text-xs text-primary-container font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">videocam</span>
                    <span>Google Meet Link Dispatched</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
