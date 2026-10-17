import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { talentService } from '@/services/talentService';
import { mentorService } from '@/services/mentorService';
import { RejectionReport, Mentor } from '@/types';
import { Timeline } from '@/components/shared/Timeline';
import { SlideOver } from '@/components/shared/SlideOver';

export const RejectionReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<RejectionReport | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState('Kernel-Level eBPF & Raft Preparation');
  const [bookingMessage, setBookingMessage] = useState(
    'Hi Marcus, I received constructive feedback from HyperScale Labs on eBPF packet routing and custom Raft consensus. I have a 3-week sprint before my re-evaluation and would love your guidance on benchmarking low-latency network proxies.'
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);

  usePageContext({
    pageKey: 'rejection_report',
    title: report ? `Growth Report — ${report.roleTitle}` : 'Rejection Growth & Feedback Report',
    summary: `Constructive readiness plan for ${report?.companyName || 'HyperScale Labs'}: ${report?.weeksRemaining || 3} weeks before re-evaluation on ${report?.targetReEvaluationDate || 'Nov 7, 2024'}. Focus on eBPF, Raft, and Rust proxy benchmarks.`,
    data: { severity: report?.severity, targetDate: report?.targetReEvaluationDate },
  });

  useEffect(() => {
    async function load() {
      const rep = await talentService.getRejectionReport(id || 'app_1');
      if (rep) {
        setReport(rep);
        if (rep.recommendedMentorId) {
          const m = await mentorService.getMentorById(rep.recommendedMentorId);
          if (m) setMentor(m);
        }
      }
    }
    load();
  }, [id]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentor) return;
    try {
      await mentorService.requestSession({
        mentorId: mentor.id,
        topic: bookingTopic,
        message: bookingMessage,
        proposedTime: 'Thursday, 2:00 PM EST',
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!report) return null;

  return (
    <div className="max-w-[1200px] mx-auto p-8 w-full pb-20 space-y-8">
      {/* Top Context & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/talent/applications"
              className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Applications</span>
            </Link>
            <span className="text-outline-variant font-label-sm text-label-sm">/</span>
            <span className="font-label-md text-label-md text-secondary">{report.companyName}</span>
            <span className="text-outline-variant font-label-sm text-label-sm">/</span>
            <span className="font-label-md text-label-md text-primary font-semibold">
              Growth &amp; Feedback Report
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface font-semibold">
              {report.roleTitle}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {report.companyName} • Seed (Founders Fund)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Constructive Feedback &amp; Readiness Plan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => alert('Exporting PDF growth report')}
            className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border border-outline-variant/30 font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">picture_as_pdf</span>
            <span>Export PDF Report</span>
          </button>
          {mentor && (
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
              <span>Share with Mentor ({mentor.name})</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. "Ready By" Countdown Card (Prominent Callout) */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Countdown Timer */}
          <div className="md:col-span-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">event_repeat</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  Target Re-evaluation Date
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                {report.targetReEvaluationDate}
              </div>
              <p className="font-body-sm text-body-sm text-secondary">
                {report.weeksRemaining * 7} Days remaining • {report.weeksRemaining}-Week Bridge Sprint
              </p>
            </div>
          </div>

          {/* Right: Target Outcome */}
          <div className="md:col-span-7 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="font-label-sm text-xs font-semibold uppercase text-secondary tracking-wider block">
                Venture Commitment
              </span>
              <p className="font-body-sm text-xs text-on-surface mt-0.5">
                HyperScale engineering leads committed to re-interviewing once benchmarked deliverables are uploaded to your profile.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-primary-fixed/50 text-primary-container shrink-0 ml-3">
              Fast-Track Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Executive Synthesis & Reason */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              rate_review
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Evaluation Synthesis &amp; Primary Gap
            </h3>
          </div>
          <span
            className={`font-label-sm text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              report.severity === 'major'
                ? 'bg-error-container text-on-error-container'
                : report.severity === 'moderate'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-blue-50 text-blue-800'
            }`}
          >
            {report.severity.toUpperCase()} TECHNICAL GAP
          </span>
        </div>

        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
          {report.primaryReason}
        </p>

        <p className="font-body-sm text-body-sm text-secondary leading-relaxed pt-2">
          {report.summary}
        </p>
      </div>

      {/* 3. Missing Skills Breakdown Table */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              checklist
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Identified Skills Gaps &amp; Learning Resources
            </h3>
          </div>
          <span className="font-label-sm text-xs text-secondary font-mono">
            {report.missingSkills.length} Core Areas
          </span>
        </div>

        <div className="divide-y divide-outline-variant/20">
          {report.missingSkills.map((sk, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-sm font-semibold text-on-surface">
                    {sk.skill}
                  </span>
                  <span
                    className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      sk.severity === 'major'
                        ? 'bg-error-container/60 text-on-error-container'
                        : sk.severity === 'moderate'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {sk.severity}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-secondary">
                  {sk.gapDescription}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low text-xs text-secondary max-w-sm shrink-0 border border-outline-variant/20">
                <span className="font-semibold text-primary-container block mb-0.5">
                  Recommended Curriculum
                </span>
                {sk.recommendedResource}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Concrete Focus Areas & Benchmarks */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-primary-container text-[20px]">
            track_changes
          </span>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Quantitative Benchmarks for Next Hiring Round
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.focusAreas.map((fa, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 space-y-2">
              <h4 className="font-headline-sm text-sm font-semibold text-on-surface">
                {fa.title}
              </h4>
              <p className="font-body-sm text-xs text-secondary">
                {fa.description}
              </p>
              <div className="pt-2 border-t border-outline-variant/20 text-xs text-primary-container font-mono">
                <strong>Benchmark:</strong> {fa.benchmark}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Week-by-Week Learning Timeline */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              timeline
            </span>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Week-by-Week Learning Sprint Timeline
            </h3>
          </div>
          <span className="font-label-sm text-xs text-primary-container font-semibold">
            Sized to {report.weeksRemaining} Weeks Before Re-evaluation
          </span>
        </div>

        <Timeline weeks={report.learningTimeline} />
      </div>

      {/* Mentor Session Booking SlideOver */}
      {mentor && (
        <SlideOver
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          title={`Book Session with ${mentor.name}`}
          subtitle={`${mentor.title} • $${mentor.hourlyRate}/hr`}
          width="max-w-md"
        >
          {bookingSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-fixed/50 text-primary-container flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check</span>
              </div>
              <h4 className="font-headline-sm text-base font-semibold text-on-surface">
                Request Sent to {mentor.name}!
              </h4>
              <p className="font-body-sm text-xs text-secondary">
                Marcus has been invited to review your eBPF benchmark preparation. Check your Session Requests tab for confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookSession} className="space-y-4">
              <div className="p-3.5 rounded-lg bg-surface-container-low flex items-center gap-3 border border-outline-variant/20">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-primary-container/20"
                />
                <div>
                  <div className="font-headline-sm text-sm font-semibold text-on-surface">
                    {mentor.name}
                  </div>
                  <div className="font-body-sm text-xs text-secondary">{mentor.company}</div>
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Topic of Consultation
                </label>
                <input
                  type="text"
                  required
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Message / Context from Growth Report
                </label>
                <textarea
                  rows={6}
                  required
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/40 rounded-lg text-xs font-body-sm text-on-surface leading-relaxed focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low/50 text-xs text-secondary">
                Next available: <strong className="text-on-surface">{mentor.availability}</strong>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                Send Request to Mentor
              </button>
            </form>
          )}
        </SlideOver>
      )}
    </div>
  );
};
