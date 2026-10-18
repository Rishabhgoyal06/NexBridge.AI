import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PageContextProvider } from '@/context/PageContext';

// Layout
import { AppShell } from '@/components/layout/AppShell';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';

// Founder Pages
import { FounderDashboardPage } from '@/pages/founder/FounderDashboardPage';
import { NewIdeaPage } from '@/pages/founder/NewIdeaPage';
import { IdeaWorkspaceLayout } from '@/pages/founder/IdeaWorkspaceLayout';
import { IdeaValidationPage } from '@/pages/founder/IdeaValidationPage';
import { IdeaMarketPage } from '@/pages/founder/IdeaMarketPage';
import { IdeaCompetitorsPage } from '@/pages/founder/IdeaCompetitorsPage';
import { IdeaRevenuePage } from '@/pages/founder/IdeaRevenuePage';
import { IdeaPlanPage } from '@/pages/founder/IdeaPlanPage';
import { IdeaRolesCandidatesPage } from '@/pages/founder/IdeaRolesCandidatesPage';
import { IdeaOutreachPage } from '@/pages/founder/IdeaOutreachPage';

// Talent Pages
import { TalentMatchesPage } from '@/pages/talent/TalentMatchesPage';
import { ApplicationsTrackerPage } from '@/pages/talent/ApplicationsTrackerPage';
import { RejectionReportPage } from '@/pages/talent/RejectionReportPage';

// Mentor Workspace Pages (mentor's own private operational workspace)
import { MentorDashboardPage } from '@/pages/mentor/MentorDashboardPage';
import { MentorRequestsPage } from '@/pages/mentor/MentorRequestsPage';
import { MentorProfilePage } from '@/pages/mentor/MentorProfilePage';

// Founder-browsable Mentor Directory (founders find & book advisors for their startup)
import { MentorsDirectoryPage } from '@/pages/mentor/MentorsDirectoryPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageContextProvider>
          <Routes>
            {/* Public Marketing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Authenticated Application Shell */}
            <Route element={<AppShell />}>

              {/* ─── FOUNDER WORKSPACE ────────────────────────────────────────
                  Routes: /founder/*, /ideas/*
                  Sidebar shows: Dashboard | My Ideas | Candidates | Outreach | Find Mentors
              ─────────────────────────────────────────────────────────────── */}
              <Route path="/founder/dashboard" element={<FounderDashboardPage />} />
              <Route path="/ideas/new" element={<NewIdeaPage />} />

              {/* Idea Workspace — tabbed analysis for a specific idea */}
              <Route path="/ideas/:id" element={<IdeaWorkspaceLayout />}>
                <Route index element={<Navigate to="validation" replace />} />
                <Route path="validation" element={<IdeaValidationPage />} />
                <Route path="market" element={<IdeaMarketPage />} />
                <Route path="competitors" element={<IdeaCompetitorsPage />} />
                <Route path="revenue" element={<IdeaRevenuePage />} />
                <Route path="plan" element={<IdeaPlanPage />} />
                <Route path="roles" element={<IdeaRolesCandidatesPage />} />
                <Route path="outreach" element={<IdeaOutreachPage />} />
              </Route>

              {/* Founder's Mentor Directory — browse & book advisors for their startup */}
              <Route path="/mentors" element={<MentorsDirectoryPage />} />
              <Route path="/mentors/:id" element={<MentorProfilePage />} />

              {/* ─── TALENT / CO-BUILDER WORKSPACE ───────────────────────────
                  Routes: /talent/*
                  Sidebar shows: Startup Matches | Applications | Growth Reports
                  NO ideas, NO candidates, NO mentors directory
              ─────────────────────────────────────────────────────────────── */}
              <Route path="/talent" element={<Navigate to="/talent/matches" replace />} />
              <Route path="/talent/matches" element={<TalentMatchesPage />} />
              <Route path="/talent/applications" element={<ApplicationsTrackerPage />} />
              <Route path="/talent/applications/:id/report" element={<RejectionReportPage />} />

              {/* ─── MENTOR / ADVISOR WORKSPACE ──────────────────────────────
                  Routes: /mentor/* (singular, the mentor's own workspace)
                  Sidebar shows: My Dashboard | Session Requests | My Profile
                  NOT the public /mentors directory. NOT ideas. NOT talent features.
              ─────────────────────────────────────────────────────────────── */}
              <Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
              <Route path="/mentor/dashboard" element={<MentorDashboardPage />} />
              <Route path="/mentor/requests" element={<MentorRequestsPage />} />
              <Route path="/mentor/profile" element={<MentorProfilePage />} />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
