import React, { useEffect } from 'react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-md',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${width} bg-surface-container-lowest shadow-2xl border-l border-outline-variant/30 flex flex-col justify-between transform transition-transform duration-200 ease-out`}
        >
          {/* Header */}
          <div className="h-16 px-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
            <div className="flex flex-col min-w-0">
              <h3 className="font-headline-sm text-[17px] font-semibold text-on-surface truncate">
                {title}
              </h3>
              {subtitle && (
                <span className="font-body-sm text-body-sm text-secondary truncate">{subtitle}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-4 px-6 border-t border-outline-variant/20 bg-surface-container-low/40">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
