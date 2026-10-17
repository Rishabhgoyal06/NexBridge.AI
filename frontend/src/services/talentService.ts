import {
  TalentProfile,
  StartupMatch,
  Application,
  RejectionReport,
} from '@/types';
import {
  demoTalentMatches,
  demoApplications,
  demoRejectionReports,
} from './mockData';
import { delay, api, USE_MOCKS, API_BASE_URL, getAccessToken } from '@/lib/http';

const TALENT_PROFILE_KEY = 'nexbridge_talent_profile';
const TALENT_MATCHES_KEY = 'nexbridge_talent_matches';
const APPLICATIONS_KEY = 'nexbridge_talent_applications';

const defaultTalentProfile: TalentProfile = {
  id: 'tal_01',
  name: 'Taras Kowalski',
  headline: 'Staff Distributed Systems Architect & High-Throughput Network Engineer',
  bio: 'Specialized in asynchronous distributed protocols, Linux eBPF telemetry, and sub-millisecond low-latency proxy architectures in Rust and Go.',
  location: 'San Francisco, CA',
  experienceYears: 8,
  skills: [
    'Distributed Systems',
    'Rust',
    'Go',
    'FastAPI',
    'PostgreSQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'Linux eBPF',
    'Raft Consensus',
  ],
  resumeFileName: 'taras_kowalski_staff_systems_resume.pdf',
  parsedAt: '2024-10-15T09:30:00Z',
};

export const talentService = {
  async getProfile(): Promise<TalentProfile> {
    if (!USE_MOCKS) {
      try {
        const liveProfile = await api<TalentProfile>('/talent/profile');
        if (liveProfile) return liveProfile;
      } catch (err) {
        console.warn('Backend /talent/profile error, falling back:', err);
      }
    }
    await delay(300, 500);
    const stored = localStorage.getItem(TALENT_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return defaultTalentProfile;
  },

  async uploadResume(fileName: string, file?: File): Promise<TalentProfile> {
    if (!USE_MOCKS) {
      try {
        const formData = new FormData();
        if (file) {
          formData.append('resume', file);
        }
        const token = await getAccessToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE_URL}/talent/resume`, {
          method: 'POST',
          headers,
          body: formData,
        });
        if (res.ok) {
          const updated = await res.json();
          return updated;
        }
      } catch (err) {
        console.warn('Backend /talent/resume error, falling back:', err);
      }
    }
    await delay(700, 1100);
    const updated: TalentProfile = {
      ...defaultTalentProfile,
      resumeFileName: fileName,
      parsedAt: new Date().toISOString(),
    };
    localStorage.setItem(TALENT_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },

  async getStartupMatches(): Promise<StartupMatch[]> {
    if (!USE_MOCKS) {
      try {
        const liveMatches = await api<StartupMatch[]>('/talent/matches');
        if (liveMatches && liveMatches.length > 0) return liveMatches;
      } catch (err) {
        console.warn('Backend /talent/matches error, falling back:', err);
      }
    }
    await delay(400, 700);
    const stored = localStorage.getItem(TALENT_MATCHES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return demoTalentMatches;
  },

  async getApplications(): Promise<Application[]> {
    if (!USE_MOCKS) {
      try {
        const liveApps = await api<Application[]>('/talent/applications');
        if (liveApps && liveApps.length > 0) return liveApps;
      } catch (err) {
        console.warn('Backend /talent/applications error, falling back:', err);
      }
    }
    await delay(400, 700);
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return demoApplications;
  },

  async getRejectionReport(applicationId: string): Promise<RejectionReport | null> {
    if (!USE_MOCKS) {
      try {
        const liveReport = await api<RejectionReport>(`/talent/applications/${applicationId}/report`);
        if (liveReport) return liveReport;
      } catch (err) {
        console.warn(`Backend /talent/applications/${applicationId}/report error:`, err);
      }
    }
    await delay(400, 800);
    const report = demoRejectionReports[applicationId];
    if (!report) {
      return demoRejectionReports['app_1'] || null;
    }
    return report;
  },
};
