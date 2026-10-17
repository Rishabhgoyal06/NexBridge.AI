import React from 'react';
import { LearningWeek } from '@/types';

interface TimelineProps {
  weeks?: LearningWeek[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ weeks = [], className = '' }) => {
  return (
    <div className={`relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40 ${className}`}>
      {weeks.map((weekItem) => {
        const isCurrent = weekItem.status === 'current';
        const isCompleted = weekItem.status === 'completed';

        return (
          <div key={weekItem.week} className="relative group">
            {/* Dot marker */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/30'
                  : isCurrent
                  ? 'bg-surface-container-lowest text-primary-container ring-4 ring-primary-fixed border-2 border-primary-container'
                  : 'bg-surface-container-high text-secondary border border-outline-variant'
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-[13px]">check</span>
              ) : isCurrent ? (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-secondary">
                    Week {weekItem.week}
                  </span>
                  <h4 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                    {weekItem.title}
                  </h4>
                </div>

                <span
                  className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-medium ${
                    isCompleted
                      ? 'bg-primary-fixed/40 text-primary-container'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-surface-container text-secondary'
                  }`}
                >
                  {isCompleted ? 'Completed' : isCurrent ? 'Active Focus' : 'Scheduled'}
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-secondary mb-3">
                <strong className="text-on-surface font-medium">Core Focus:</strong> {weekItem.focus}
              </p>

              <div className="space-y-1.5 pt-1 border-t border-outline-variant/20">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-medium">
                  Action Deliverables
                </span>
                <ul className="space-y-1 font-body-sm text-body-sm text-on-surface">
                  {weekItem.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary-container text-xs mt-0.5">▪</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
