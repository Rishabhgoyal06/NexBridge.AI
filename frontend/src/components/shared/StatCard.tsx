import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: string;
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_1px_3px_rgba(17,17,17,0.04)] hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-label-md text-label-md text-secondary font-medium">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary font-medium">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-label-sm text-label-sm font-semibold ${
              trend.isNeutral
                ? 'text-secondary'
                : trend.isPositive
                ? 'text-primary-container'
                : 'text-error'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {trend.isNeutral ? 'trending_flat' : trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            {trend.value}
          </span>
        )}
        {subtitle && (
          <span className="font-body-sm text-body-sm text-secondary truncate">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
