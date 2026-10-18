import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGlobalPageContext } from '@/context/PageContext';
import { UserRole } from '@/types';

export const TopBar: React.FC = () => {
  const { role, logout } = useAuth();
  const { context } = useGlobalPageContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active workspace from URL — same logic as Sidebar
  const isTalent = location.pathname.startsWith('/talent');
  const isMentor =
    location.pathname.startsWith('/mentor/') || location.pathname === '/mentor';
  const isFounder =
    location.pathname.startsWith('/founder') ||
    location.pathname.startsWith('/ideas') ||
    location.pathname.startsWith('/mentors');

  const workspace: UserRole = isTalent
    ? 'talent'
    : isMentor
      ? 'mentor'
      : isFounder
        ? 'founder'
        : role;

  // Switching role requires signing out and signing in as a different user.
  // We redirect to /auth with the target role pre-selected as a query param.
  const handleRoleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetRole = e.target.value as UserRole;
    if (targetRole === workspace) return; // already there
    // Sign out the current user first, then send to auth page with target role
    await logout();
    navigate(`/auth?role=${targetRole}`);
  };

  return (
    <header className="fixed top-0 left-[232px] right-0 h-14 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/35 shadow-[0_1px_3px_rgba(0,0,0,0.03)] z-40 px-8 flex items-center justify-between">
      {/* Breadcrumb Context */}
      <div className="flex items-center gap-1.5 font-body-md text-body-md text-secondary">
        <span className="hover:text-on-surface transition-colors cursor-pointer">NexBridge</span>
        <span className="text-outline-variant">/</span>
        <span className="font-medium text-on-surface truncate max-w-[280px]">
          {context.title}
        </span>
      </div>

      {/* Center/Right Action Bar */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative items-center hidden md:flex">
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-secondary">
            search
          </span>
          <input
            className="w-60 pl-9 pr-12 py-1.5 h-9 bg-surface-container-lowest border border-outline-variant/40 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            placeholder="Search ideas, talent, mentors..."
            type="text"
          />
          <kbd className="absolute right-2.5 font-label-sm text-[10px] px-1 py-0.5 rounded bg-surface-container text-secondary border border-outline-variant/40 leading-none">
            ⌘K
          </kbd>
        </div>

        {/* Role Switcher — logs out + redirects to /auth for proper re-authentication */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-primary-container">
            manage_accounts
          </span>
          <span className="font-label-sm text-[11px] text-secondary font-medium uppercase tracking-wider hidden sm:inline">
            Mode:
          </span>
          <select
            value={workspace}
            onChange={handleRoleSwitch}
            title="Switching mode will sign you out and redirect to login"
            className="bg-transparent font-label-sm text-label-sm font-semibold text-primary-container focus:outline-none cursor-pointer pr-1"
          >
            <option value="founder">Founder / Startup</option>
            <option value="talent">Talent / Co-builder</option>
            <option value="mentor">Mentor / Advisor</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full ring-2 ring-surface-container-low"></span>
        </button>

        {/* Primary Action Button — workspace-specific CTA */}
        {workspace === 'founder' ? (
          <Link
            to="/ideas/new"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-primary-container text-on-primary font-body-md text-body-md font-medium hover:bg-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Idea</span>
          </Link>
        ) : workspace === 'talent' ? (
          <Link
            to="/talent/matches"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-primary-container text-on-primary font-body-md text-body-md font-medium hover:bg-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Update Resume</span>
          </Link>
        ) : (
          <Link
            to="/mentor/requests"
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-primary-container text-on-primary font-body-md text-body-md font-medium hover:bg-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">event_available</span>
            <span>Sessions</span>
          </Link>
        )}
      </div>
    </header>
  );
};
