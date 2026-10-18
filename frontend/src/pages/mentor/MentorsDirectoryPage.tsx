import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { mentorService } from '@/services/mentorService';
import { Mentor } from '@/types';
import { formatHourlyRate } from '@/lib/currency';

export const MentorsDirectoryPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  usePageContext({
    pageKey: 'mentors_directory',
    title: 'Advisors & Mentors Directory — NexBridge.ai',
    summary: 'Executive mentors catalog: 8 verified startup leaders including Marcus Vance (ex-Peloton) and Sarah Lin (ex-MyFitnessPal).',
    data: { mentorCount: mentors.length },
  });

  const domains = [
    'All',
    'Retention',
    'Nutrition',
    'Sports Science',
    'Growth',
    'Hardware',
    'YC Prep',
    'Edge AI',
  ];

  useEffect(() => {
    async function load() {
      const list = await mentorService.getMentors(searchQuery, selectedDomain);
      setMentors(list);
    }
    load();
  }, [searchQuery, selectedDomain]);

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-8">
      {/* Directory Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Advisory Network
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">
              Verified Operators
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
            Venture Mentors &amp; Domain Advisors
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Connect with seasoned founders and product executives to stress-test your GTM, technical moats, and retention loops.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-secondary">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, skill..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {domains.map((dom) => (
          <button
            key={dom}
            type="button"
            onClick={() => setSelectedDomain(dom)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDomain === dom
                ? 'bg-primary-container text-on-primary shadow-xs'
                : 'bg-surface-container-lowest hover:bg-surface-container text-secondary hover:text-on-surface border border-outline-variant/30'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* Mentors Grid (8 Mentors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Mentor Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/20 mb-4">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-container/20 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-base font-semibold text-on-surface truncate">
                      {mentor.name}
                    </h3>
                  </div>
                  <p className="font-body-sm text-xs text-primary-container font-medium truncate mt-0.5">
                    {mentor.title}
                  </p>
                  <p className="font-body-sm text-[11px] text-secondary truncate mt-0.5">
                    {mentor.company}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary font-mono">
                    <span className="material-symbols-outlined text-[15px] text-amber-500 fill">
                      star
                    </span>
                    <strong className="text-on-surface font-semibold">{mentor.rating}</strong>
                    <span>({mentor.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="font-body-sm text-xs text-secondary leading-relaxed line-clamp-3 mb-4">
                {mentor.bio}
              </p>

              {/* Domains */}
              <div className="space-y-1.5 mb-4">
                <span className="font-label-sm text-[10px] uppercase tracking-wider text-secondary font-semibold block">
                  Advisory Focus
                </span>
                <div className="flex flex-wrap gap-1">
                  {mentor.domains.map((dom, idx) => (
                    <span
                      key={idx}
                      className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-container-low text-secondary border border-outline-variant/20"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Past Exits */}
              {mentor.pastExits.length > 0 && (
                <div className="text-[11px] text-secondary mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">
                    emoji_events
                  </span>
                  <span>Exits: {mentor.pastExits.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Hourly Rate & Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  {formatHourlyRate(mentor.hourlyRate)}
                </span>
                <span className="text-xs text-secondary">/hour</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/mentors/${mentor.id}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs font-medium transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to={`/mentors/${mentor.id}?book=true`}
                  className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs font-medium transition-colors shadow-2xs"
                >
                  Request Call
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
