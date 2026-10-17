import React from 'react';

interface SkillChipProps {
  name: string;
  matched?: boolean;
  severity?: 'minor' | 'moderate' | 'major';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  name,
  matched,
  severity,
  size = 'md',
  onRemove,
  className = '',
}) => {
  let styleClasses = 'bg-surface-container text-on-surface';

  if (severity === 'major') {
    styleClasses = 'bg-error-container/60 text-on-error-container border border-error/20';
  } else if (severity === 'moderate') {
    styleClasses = 'bg-amber-100 text-amber-900 border border-amber-200';
  } else if (severity === 'minor') {
    styleClasses = 'bg-blue-50 text-blue-800 border border-blue-200';
  } else if (matched === true) {
    styleClasses = 'bg-primary-fixed/40 text-primary-container font-medium border border-primary-container/20';
  } else if (matched === false) {
    styleClasses = 'bg-surface-container-high text-secondary border border-outline-variant/30';
  }

  const sizeClasses =
    size === 'sm'
      ? 'h-5 px-2 text-[11px]'
      : 'h-6 px-2.5 text-label-sm font-label-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses} ${styleClasses} transition-colors select-none ${className}`}
    >
      {matched === true && (
        <span className="material-symbols-outlined text-[13px] text-primary-container">check</span>
      )}
      {matched === false && (
        <span className="material-symbols-outlined text-[13px] text-secondary">add</span>
      )}
      {severity && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            severity === 'major'
              ? 'bg-error'
              : severity === 'moderate'
              ? 'bg-amber-600'
              : 'bg-blue-600'
          }`}
        />
      )}
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[12px]">close</span>
        </button>
      )}
    </span>
  );
};
