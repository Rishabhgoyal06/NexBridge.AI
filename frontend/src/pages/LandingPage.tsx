import React from 'react';
import { Link } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';

export const LandingPage: React.FC = () => {
  usePageContext({
    pageKey: 'landing',
    title: 'NexBridge.ai — High-Conviction AI Venture Studio',
    summary: 'Executive landing page for autonomous 5-agent startup validation and team assembly',
  });

  return (
    <div className="w-full bg-surface min-h-screen text-on-surface">
      {/* 1. Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary transition-transform group-hover:scale-95">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
                NexBridge<span className="text-primary-container font-normal">.ai</span>
              </span>
            </Link>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider">
              Beta 2.4
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md">
              Features
            </a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md">
              How it works
            </a>
            <a href="#demo-preview" className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md">
              Live Preview
            </a>
            <a href="#advisors" className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md">
              Advisors
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-on-surface-variant hover:text-on-surface font-label-md text-label-md px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/founder/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 h-10 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary transition-all duration-150"
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20">
        {/* HERO SECTION */}
        <section className="w-full pt-16 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F1EA] shadow-sm mb-6 transition-transform hover:scale-[1.01]">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wide">
              NexBridge 2.4 Active
            </span>
            <span className="text-[#707A6F] text-xs font-normal">/</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Autonomous 5-Agent Startup Synthesis
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-headline-xl text-headline-xl md:text-[56px] md:leading-[1.08] tracking-[-0.035em] text-[#111111] max-w-4xl mx-auto text-center font-semibold">
            From idea to team, with AI that pushes back.
          </h1>

          {/* Subline */}
          <p className="font-body-lg text-body-lg text-[#57534E] max-w-2xl mx-auto text-center mt-6 leading-relaxed">
            Most tools tell founders what they want to hear. NexBridge interrogates customer willingness-to-pay, stress-tests your unit economics across 5 specialized AI agents, and auto-assembles your founding team when signals turn green.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/founder/dashboard"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-medium shadow-sm hover:bg-primary transition-all duration-150"
            >
              <span>Explore Founder Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/ideas/new"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md font-medium shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-container">
                psychology
              </span>
              <span>Test an Idea Live</span>
            </Link>
          </div>

          {/* Trust Micro-Bar */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <span className="font-label-sm text-label-sm text-[#707A6F] uppercase tracking-wider font-medium text-center">
              Trusted by 1,400+ technical founders backed by
            </span>
            <div className="flex flex-wrap items-center justify-center gap-8 text-[#57534E] font-label-md text-label-md font-semibold tracking-tight">
              <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px] text-[#707A6F]">change_history</span> Y Combinator
              </span>
              <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span> Sequoia Capital
              </span>
              <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px] text-[#707A6F]">token</span> Benchmark
              </span>
              <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span className="w-1.5 h-1.5 rounded-full bg-[#707A6F]"></span> Andreessen Horowitz
              </span>
            </div>
          </div>
        </section>

        {/* 2. PRODUCT PREVIEW BROWSER FRAME */}
        <section className="w-full px-6 max-w-6xl mx-auto mb-20" id="demo-preview">
          <div className="w-full rounded-[20px] bg-surface-container-lowest shadow-[0_20px_48px_-12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            {/* Browser Top Shell */}
            <div className="h-11 bg-surface-container-low px-4 flex items-center justify-between border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#F28B82] opacity-80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-[#FDD663] opacity-80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-[#81C995] opacity-80 inline-block"></span>
              </div>
              <div className="px-5 py-1 rounded-full bg-surface-container-lowest text-[#57534E] font-label-sm text-label-sm flex items-center gap-2 shadow-xs border border-outline-variant/30">
                <span className="material-symbols-outlined text-[14px] text-primary-container">lock</span>
                <span>app.nexbridge.ai/ideas/idea_gym_meal_planner/validation</span>
                <span className="material-symbols-outlined text-[13px] text-[#707A6F]">refresh</span>
              </div>
              <div className="flex items-center gap-2 text-[#707A6F]">
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </div>
            </div>

            {/* Browser Preview Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F1EA] flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[22px]">fitness_center</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-[#111111] font-semibold">
                        NutriFit AI
                      </span>
                      <span className="font-body-sm text-body-sm text-[#57534E] font-medium">
                        (AI Meal Planner for Gym-Goers)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F1EA] text-primary-container font-label-sm text-label-sm font-semibold">
                        Stage: Validated
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-[#707A6F] flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
                      5 AI Agents synthesized in parallel • Strong market signal (78/100)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/ideas/idea_gym_meal_planner/validation"
                    className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-medium flex items-center gap-1 shadow-sm hover:bg-primary transition-colors"
                  >
                    <span>Open Live Workspace</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                  </Link>
                </div>
              </div>

              {/* Bento snapshot in preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                  <div className="font-label-sm text-label-sm text-secondary uppercase font-semibold mb-1">
                    Validation Index
                  </div>
                  <div className="text-3xl font-bold text-on-surface">78 <span className="text-sm font-normal text-secondary">/100</span></div>
                  <p className="text-xs text-primary-container font-medium mt-1">High Willingness-to-Pay Signal</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                  <div className="font-label-sm text-label-sm text-secondary uppercase font-semibold mb-1">
                    Unit Economics
                  </div>
                  <div className="text-3xl font-bold text-on-surface">3.23x <span className="text-sm font-normal text-secondary">LTV:CAC</span></div>
                  <p className="text-xs text-secondary mt-1">$122.90 LTV vs $38 Blended CAC</p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                  <div className="font-label-sm text-label-sm text-secondary uppercase font-semibold mb-1">
                    Matched Talent
                  </div>
                  <div className="text-3xl font-bold text-on-surface">6 <span className="text-sm font-normal text-secondary">Candidates</span></div>
                  <p className="text-xs text-primary-container font-medium mt-1">Elena Rostova (94% match) ready</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THREE CORE ROLES / VALUE PILLARS */}
        <section className="w-full py-16 px-6 max-w-7xl mx-auto border-t border-outline-variant/20" id="features">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface">
              Built for the tripartite venture ecosystem
            </h2>
            <p className="font-body-md text-body-md text-secondary mt-2">
              Founders stress-test conviction, top talent finds high-trajectory teams with growth feedback, and mentors guide execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Founder Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#E8F1EA] text-primary-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  For Founders
                </h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-4">
                  Submit an idea and trigger 5 autonomous agents in parallel: Market Analyst, Competitor Researcher, Revenue Critic, Technical Architect, and Skeptic. Receive structured moats, unit economics, and auto-matched candidates.
                </p>
              </div>
              <Link
                to="/founder/dashboard"
                className="font-label-md text-label-md text-primary-container font-medium flex items-center gap-1 hover:underline"
              >
                <span>Enter Founder Hub</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Talent Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[22px]">handshake</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  For Talent &amp; Co-builders
                </h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-4">
                  Upload your resume to extract skills and match with high-conviction seed startups. On rejection, receive constructive reports with missing skills and a week-by-week learning timeline sized to the next hiring round.
                </p>
              </div>
              <Link
                to="/talent/matches"
                className="font-label-md text-label-md text-primary-container font-medium flex items-center gap-1 hover:underline"
              >
                <span>Explore Talent Matches</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {/* Mentor Card */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  For Mentors &amp; Advisors
                </h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed mb-4">
                  Share expertise with verified venture teams. Founders browse verified profiles like Marcus Vance and Sarah Lin to book targeted sessions on retention mechanics, architecture, and fundraising.
                </p>
              </div>
              <Link
                to="/mentors"
                className="font-label-md text-label-md text-primary-container font-medium flex items-center gap-1 hover:underline"
              >
                <span>Browse Mentors Directory</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. FOOTER */}
        <footer className="w-full py-12 px-6 border-t border-outline-variant/30 bg-surface-container-low/40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-xs">
                N
              </div>
              <span className="font-headline-sm text-[15px] font-semibold text-on-surface">
                NexBridge<span className="text-primary-container font-normal">.ai</span>
              </span>
              <span className="text-secondary text-xs ml-2">© 2024 NexBridge Technologies Inc.</span>
            </div>

            <div className="flex items-center gap-6 font-label-md text-label-md text-secondary">
              <Link to="/founder/dashboard" className="hover:text-on-surface transition-colors">
                Founder App
              </Link>
              <Link to="/talent/matches" className="hover:text-on-surface transition-colors">
                Talent Portal
              </Link>
              <Link to="/mentors" className="hover:text-on-surface transition-colors">
                Advisors
              </Link>
              <Link to="/auth" className="hover:text-on-surface transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
