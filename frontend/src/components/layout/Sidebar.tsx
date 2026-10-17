import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGlobalPageContext } from '@/context/PageContext';
import { useActiveIdea } from '@/hooks/useActiveIdea';

export const Sidebar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { toggleChat } = useGlobalPageContext();
  const navigate = useNavigate();
  const { activeIdeaId } = useActiveIdea();

  // If user has no idea yet, "My Ideas" → New Idea page; otherwise → their workspace
  const ideaBase = activeIdeaId ? `/ideas/${activeIdeaId}` : '/ideas/new';

  interface NavItem {
    label: string;
    path: string;
    icon: string;
    badge?: string;
  }

  const founderNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/founder/dashboard', icon: 'grid_view' },
    { label: 'My Ideas', path: activeIdeaId ? `${ideaBase}/validation` : '/ideas/new', icon: 'lightbulb' },
    { label: 'Candidates', path: activeIdeaId ? `${ideaBase}/roles` : '/ideas/new', icon: 'group' },
    { label: 'Outreach Pipeline', path: activeIdeaId ? `${ideaBase}/outreach` : '/ideas/new', icon: 'send' },
    { label: 'Mentors', path: '/mentors', icon: 'explore' },
  ];

  const talentNavItems: NavItem[] = [
    { label: 'Startup Matches', path: '/talent/matches', icon: 'compare_arrows', badge: '6' },
    { label: 'Applications', path: '/talent/applications', icon: 'assignment', badge: '5' },
    { label: 'Growth Reports', path: '/talent/applications/app_1/report', icon: 'psychology', badge: '2' },
    { label: 'Mentors', path: '/mentors', icon: 'school' },
  ];

  const mentorNavItems: NavItem[] = [
    { label: 'Directory', path: '/mentors', icon: 'explore' },
    { label: 'Session Requests', path: '/mentors/requests', icon: 'calendar_month', badge: '2' },
    { label: 'My Profile', path: '/mentors/mentor_1', icon: 'account_circle' },
  ];

  const currentNav =
    role === 'founder'
      ? founderNavItems
      : role === 'talent'
      ? talentNavItems
      : mentorNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[232px] bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <Link
          to="/"
          className="h-14 px-4 flex items-center gap-2.5 border-b border-outline-variant/20 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">hub</span>
          </div>
          <span className="font-headline-sm text-[15px] font-semibold tracking-tight text-on-surface leading-none">
            NexBridge<span className="text-primary-container font-normal">.ai</span>
          </span>
          <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-medium uppercase tracking-wider scale-90">
            BETA
          </span>
        </Link>

        {/* Role indicator pill */}
        <div className="px-4 pt-3 pb-1">
          <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-semibold">
            {role.toUpperCase()} WORKSPACE
          </span>
        </div>

        {/* Navigation list */}
        <div className="p-3">
          <nav className="flex flex-col gap-1">
            {currentNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-body-md text-body-md ${
                    isActive
                      ? 'bg-primary-fixed/30 text-primary-container font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="font-label-sm text-label-sm px-1.5 py-0.2 rounded-full bg-surface-container text-secondary font-medium">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="my-3 border-t border-outline-variant/30"></div>

          {/* Quick AI Assistant Trigger */}
          <div className="flex flex-col gap-1">
            <button
              onClick={toggleChat}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[19px] text-surface-tint">
                  auto_awesome
                </span>
                <span>Ask assistant</span>
              </div>
              <kbd className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-secondary border border-outline-variant/40 leading-none">
                ⌘J
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* User profile section */}
      <div className="p-3 border-t border-outline-variant/20">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-outline-variant/40"
              src={user.avatar}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-body-md text-[13px] font-semibold text-on-surface truncate leading-tight">
                {user.name}
              </span>
              <span className="font-body-sm text-[11px] text-secondary truncate leading-tight capitalize">
                {user.role} Intent
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/auth');
            }}
            title="Sign out"
            className="text-secondary hover:text-on-surface transition-colors p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
