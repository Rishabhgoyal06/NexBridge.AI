import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePageContext } from '@/context/PageContext';
import { UserRole } from '@/types';

export const AuthPage: React.FC = () => {
  usePageContext({
    pageKey: 'auth',
    title: 'Authentication & Role Intent',
    summary: 'Sign in or create account with Founder, Talent, or Mentor workspace intent',
  });

  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('founder');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('aarav@nexbridge.ai');
  const [password, setPassword] = useState('NexBridge2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both email and password.');
      }

      if (isSignUp) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await signUp(email.trim(), password, selectedRole, name.trim() || undefined);
      } else {
        await login(email.trim(), password, selectedRole);
      }

      if (selectedRole === 'founder') {
        navigate('/founder/dashboard');
      } else if (selectedRole === 'talent') {
        navigate('/talent/matches');
      } else {
        navigate('/mentors');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = async (demoEmail: string, demoRole: UserRole, demoName: string, autoSubmit = true) => {
    setEmail(demoEmail);
    setPassword('NexBridge2026!');
    setSelectedRole(demoRole);
    setName(demoName);
    setIsSignUp(false);
    setErrorMsg(null);

    if (autoSubmit) {
      setIsSubmitting(true);
      try {
        await login(demoEmail, 'NexBridge2026!', demoRole);
        if (demoRole === 'founder') {
          navigate('/founder/dashboard');
        } else if (demoRole === 'talent') {
          navigate('/talent/matches');
        } else {
          navigate('/mentors');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Login failed.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased flex flex-col">
      {/* Top Bar Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 px-6 md:px-12 flex items-center justify-between border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
            NexBridge<span className="text-primary-container font-normal">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline">
            Need assistance?
          </span>
          <a
            href="mailto:support@nexbridge.ai"
            className="font-label-md text-label-md text-primary-container hover:text-primary transition-colors font-medium"
          >
            Support
          </a>
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="w-full min-h-screen pt-16 flex flex-col lg:flex-row flex-1">
        {/* Left Pane: Authentication Canvas */}
        <div className="w-full lg:w-[52%] flex flex-col justify-between px-6 py-10 md:px-12 lg:px-16 xl:px-20 bg-surface">
          {/* Top Notch */}
          <div className="w-full flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary-container flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[15px]">security</span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">
                NexBridge Auth
              </span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                Supabase JWT Secured
              </span>
            </div>

            <div className="flex items-center gap-2 font-label-md text-label-md">
              <span className="text-on-surface-variant hidden sm:inline">
                {isSignUp ? 'Already registered?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                }}
                className="text-primary-container hover:text-primary font-semibold transition-colors cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </div>

          {/* Center Card */}
          <div className="w-full max-w-[430px] mx-auto py-6">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                Enterprise Access &amp; Venturing
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold mb-2">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isSignUp
                  ? 'Join the high-conviction AI venture studio with cryptographically verified credentials.'
                  : 'Enter your verified credentials to access your autonomous studio workspace.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 mb-5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 flex items-start gap-2.5 text-body-sm transition-all">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Role Selector Pill */}
            <div className="mb-6">
              <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-medium">
                Select Workspace Intent
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container rounded-xl">
                {/* Founder Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('founder')}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    selectedRole === 'founder'
                      ? 'bg-surface-container-lowest text-primary-container shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-1">rocket_launch</span>
                  <span className="font-label-md text-label-md text-on-surface">Founder</span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant leading-none mt-0.5">
                    Venture Hub
                  </span>
                </button>

                {/* Talent Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('talent')}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    selectedRole === 'talent'
                      ? 'bg-surface-container-lowest text-primary-container shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-1">handshake</span>
                  <span className="font-label-md text-label-md text-on-surface">Co-builder</span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant leading-none mt-0.5">
                    Tech / Ops
                  </span>
                </button>

                {/* Mentor Role */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('mentor')}
                  className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    selectedRole === 'mentor'
                      ? 'bg-surface-container-lowest text-primary-container shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-1">verified_user</span>
                  <span className="font-label-md text-label-md text-on-surface">Advisor</span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant leading-none mt-0.5">
                    Cap / GTM
                  </span>
                </button>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[11px] text-secondary font-normal">
                    {isSignUp ? 'Min. 6 characters' : ''}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-surface-container-lowest border border-outline-variant/40 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-medium shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-4 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                    <span>Authenticating with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? `Create ${selectedRole} Account` : 'Sign In'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Verified Demo Credentials Quick-Fill */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-medium">
                  Verified Demo Accounts (1-Click Fill)
                </span>
                <span className="text-[10px] text-primary-container font-mono bg-primary-container/10 px-1.5 py-0.5 rounded">
                  Password: NexBridge2026!
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('aarav@nexbridge.ai', 'founder', 'Aarav Patel')}
                  className="px-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface text-center transition-colors border border-outline-variant/30 cursor-pointer"
                >
                  🚀 Aarav (Founder)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('taras@hyperscale.io', 'talent', 'Taras Kowalski')}
                  className="px-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface text-center transition-colors border border-outline-variant/30 cursor-pointer"
                >
                  🤝 Taras (Talent)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('marcus@vance.io', 'mentor', 'Marcus Vance')}
                  className="px-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface text-center transition-colors border border-outline-variant/30 cursor-pointer"
                >
                  🎓 Marcus (Advisor)
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="w-full text-center py-4 font-body-sm text-[11px] text-secondary">
            Secured by Supabase Auth with HMAC-SHA256 JWT tokens &amp; PostgreSQL Row-Level Security.
          </div>
        </div>

        {/* Right Pane: Editorial Branding Side Graphic */}
        <div className="hidden lg:flex w-[48%] bg-surface-container-low border-l border-outline-variant/20 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest text-primary-container font-label-sm text-label-sm font-semibold mb-8 shadow-xs border border-outline-variant/30">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              Cryptographically Verified Studio Security
            </div>

            <blockquote className="space-y-4">
              <p className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight leading-snug">
                “NexBridge’s 5-agent stress test pointed out our Day-30 churn vulnerability before we spent $200k building the wrong nutrition features. It saved us months.”
              </p>
              <footer className="flex items-center gap-3 pt-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Marcus Vance"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-container/20"
                />
                <div>
                  <div className="font-headline-sm text-sm font-semibold text-on-surface">
                    Marcus Vance
                  </div>
                  <div className="font-body-sm text-xs text-secondary">
                    ex-VP Product at Peloton &amp; Strava
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-secondary uppercase tracking-wider">
              <span>Security Standards</span>
              <span className="text-emerald-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface font-medium">Supabase Auth Provider</span>
                <span className="text-primary-container font-mono">Bcrypt Passwords</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface font-medium">API Token Type</span>
                <span className="text-primary-container font-mono">Bearer JWT (ES256)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface font-medium">Database Layer</span>
                <span className="text-primary-container font-mono">Row-Level Security</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
