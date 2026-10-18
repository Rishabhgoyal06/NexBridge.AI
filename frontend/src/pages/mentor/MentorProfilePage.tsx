import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { mentorService } from '@/services/mentorService';
import { Mentor } from '@/types';
import { formatHourlyRate } from '@/lib/currency';

export const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [mentor, setMentor] = useState<Mentor | null>(null);

  const [topic, setTopic] = useState('Mitigating Day-30 Churn in Fitness SaaS');
  const [proposedTime, setProposedTime] = useState('Tomorrow, 2:00 PM EST');
  const [message, setMessage] = useState(
    'Hi Marcus, our AI validation scored NutriFit AI at 78/100, but flagged churn risk. We would love to book 45 minutes of your time to review our habit loop design and discuss retention metrics from your Peloton and Strava days.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  usePageContext({
    pageKey: 'mentor_profile',
    title: mentor ? `Advisor Profile — ${mentor.name}` : 'Mentor Profile',
    summary: `Operator profile for ${mentor?.name || 'Marcus Vance'}: ${mentor?.title || 'ex-VP Product at Peloton & Strava'}. ${formatHourlyRate(mentor?.hourlyRate || 250)}/hr.`,
    data: { mentorId: id, rating: mentor?.rating },
  });

  useEffect(() => {
    async function load() {
      const found = await mentorService.getMentorById(id || 'mentor_1');
      if (found) {
        setMentor(found);
        if (found.availableSlots.length > 0) {
          setProposedTime(found.availableSlots[0]);
        }
      }
    }
    load();
  }, [id]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentor) return;
    setIsSubmitting(true);
    try {
      await mentorService.requestSession({
        mentorId: mentor.id,
        topic,
        message,
        proposedTime,
      });
      setRequestSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mentor) return null;

  return (
    <div className="max-w-[1100px] mx-auto p-8 w-full pb-20 space-y-8">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-xs text-secondary">
        <Link to="/mentors" className="hover:text-on-surface transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">arrow_back</span>
          <span>Back to Mentors Directory</span>
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium">{mentor.name}</span>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-fixed/30 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-2xl font-semibold text-on-surface">
                {mentor.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-xs font-semibold">
                Verified Advisor
              </span>
            </div>
            <p className="font-body-md text-sm text-primary-container font-medium">
              {mentor.title}
            </p>
            <p className="font-body-sm text-xs text-secondary">{mentor.company}</p>

            <div className="flex items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <span className="material-symbols-outlined text-[16px] fill">star</span>
                <span className="font-bold text-on-surface font-mono">{mentor.rating}</span>
                <span className="text-secondary">({mentor.reviewsCount} reviews)</span>
              </div>
              <span className="text-outline-variant">•</span>
              <span className="text-secondary">{mentor.availability}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 shrink-0">
          <div className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">
            Advisory Retainer
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-on-surface">{formatHourlyRate(mentor.hourlyRate)}</span>
            <span className="text-xs text-secondary">/hour</span>
          </div>
          <span className="text-[11px] text-primary-container font-medium">
            100% Satisfaction Guarantee
          </span>
        </div>
      </div>

      {/* Main Grid: Bio & Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bio & Credentials */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant/20 pb-3">
              Operator Background
            </h3>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              {mentor.bio}
            </p>

            <div>
              <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-secondary block mb-2">
                Specialized Domains &amp; Playbooks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {mentor.domains.map((dom, idx) => (
                  <span
                    key={idx}
                    className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            </div>

            {mentor.pastExits.length > 0 && (
              <div className="p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                <span className="font-label-sm text-xs font-semibold text-primary-container uppercase tracking-wider block mb-1">
                  Notable Exits &amp; Scale
                </span>
                <p className="text-xs text-on-surface">
                  {mentor.pastExits.join(' • ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Request Advisory Session Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant/20 pb-3">
            Request Consultation Call
          </h3>

          {requestSent ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check</span>
              </div>
              <h4 className="font-headline-sm text-base font-semibold text-on-surface">
                Advisory Request Submitted!
              </h4>
              <p className="font-body-sm text-xs text-secondary leading-relaxed">
                Marcus has been notified and usually responds within 4 business hours. You can track this under{' '}
                <Link to="/mentor/requests" className="text-primary-container font-semibold hover:underline">
                  Session Requests
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Advisory Focus / Topic
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Select Preferred Window
                </label>
                <select
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container cursor-pointer"
                >
                  {mentor.availableSlots.map((slot, sIdx) => (
                    <option key={sIdx} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Context / Questions for {mentor.name}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface leading-relaxed focus:outline-none focus:border-primary-container"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-medium transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : `Request Session (${formatHourlyRate(mentor.hourlyRate)})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
