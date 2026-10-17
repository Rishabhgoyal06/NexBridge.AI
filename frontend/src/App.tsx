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
import { IdeaCompetitorsPage } from '@/pages/founder/IdeaCompetitorsPage';
import { IdeaRevenuePage } from '@/pages/founder/IdeaRevenuePage';
import { IdeaPlanPage } from '@/pages/founder/IdeaPlanPage';
import { IdeaRolesCandidatesPage } from '@/pages/founder/IdeaRolesCandidatesPage';
import { IdeaOutreachPage } from '@/pages/founder/IdeaOutreachPage';

// Talent Pages
import { TalentMatchesPage } from '@/pages/talent/TalentMatchesPage';
import { ApplicationsTrackerPage } from '@/pages/talent/ApplicationsTrackerPage';
import { RejectionReportPage } from '@/pages/talent/RejectionReportPage';

// Mentor Pages
import { MentorsDirectoryPage } from '@/pages/mentor/MentorsDirectoryPage';
import { MentorProfilePage } from '@/pages/mentor/MentorProfilePage';
import { MentorRequestsPage } from '@/pages/mentor/MentorRequestsPage';

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
              {/* Founder Routes */}
              <Route path="/founder/dashboard" element={<FounderDashboardPage />} />
              <Route path="/ideas/new" element={<NewIdeaPage />} />

              {/* Idea Workspace Tabbed Routes */}
              <Route path="/ideas/:id" element={<IdeaWorkspaceLayout />}>
                <Route index element={<Navigate to="validation" replace />} />
                <Route path="validation" element={<IdeaValidationPage />} />
                <Route path="competitors" element={<IdeaCompetitorsPage />} />
                <Route path="revenue" element={<IdeaRevenuePage />} />
                <Route path="plan" element={<IdeaPlanPage />} />
                <Route path="roles" element={<IdeaRolesCandidatesPage />} />
                <Route path="outreach" element={<IdeaOutreachPage />} />
              </Route>

              {/* Talent Routes */}
              <Route path="/talent" element={<Navigate to="/talent/matches" replace />} />
              <Route path="/talent/matches" element={<TalentMatchesPage />} />
              <Route path="/talent/applications" element={<ApplicationsTrackerPage />} />
              <Route path="/talent/applications/:id/report" element={<RejectionReportPage />} />

              {/* Mentor Routes */}
              <Route path="/mentors" element={<MentorsDirectoryPage />} />
              <Route path="/mentors/requests" element={<MentorRequestsPage />} />
              <Route path="/mentors/:id" element={<MentorProfilePage />} />
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
