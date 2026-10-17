import { Mentor, MentorRequest } from '@/types';
import { demoMentors, demoMentorRequests } from './mockData';
import { delay, api, USE_MOCKS } from '@/lib/http';

const MENTORS_KEY = 'nexbridge_mentors';
const MENTOR_REQUESTS_KEY = 'nexbridge_mentor_requests';

function getStoredMentors(): Mentor[] {
  const raw = localStorage.getItem(MENTORS_KEY);
  if (!raw) {
    localStorage.setItem(MENTORS_KEY, JSON.stringify(demoMentors));
    return demoMentors;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return demoMentors;
  }
}

function getStoredRequests(): MentorRequest[] {
  const raw = localStorage.getItem(MENTOR_REQUESTS_KEY);
  if (!raw) {
    localStorage.setItem(MENTOR_REQUESTS_KEY, JSON.stringify(demoMentorRequests));
    return demoMentorRequests;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return demoMentorRequests;
  }
}

export const mentorService = {
  async getMentors(query?: string, domain?: string): Promise<Mentor[]> {
    if (!USE_MOCKS) {
      try {
        const liveMentors = await api<Mentor[]>(`/mentors?query=${encodeURIComponent(query || '')}&domain=${encodeURIComponent(domain || '')}`);
        if (liveMentors && liveMentors.length > 0) return liveMentors;
      } catch (err) {
        console.warn('Backend /mentors error, falling back:', err);
      }
    }
    await delay(400, 700);
    let list = getStoredMentors();
    if (domain && domain !== 'All') {
      list = list.filter((m) =>
        m.domains.some((d) => d.toLowerCase().includes(domain.toLowerCase()))
      );
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.domains.some((d) => d.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getMentorById(id: string): Promise<Mentor | undefined> {
    if (!USE_MOCKS) {
      try {
        const liveMentor = await api<Mentor>(`/mentors/${id}`);
        if (liveMentor) return liveMentor;
      } catch (err) {
        console.warn(`Backend /mentors/${id} error, falling back:`, err);
      }
    }
    await delay(300, 500);
    const list = getStoredMentors();
    return list.find((m) => m.id === id);
  },

  async requestSession(payload: {
    mentorId: string;
    topic: string;
    message: string;
    proposedTime: string;
    founderName?: string;
    startupName?: string;
  }): Promise<MentorRequest> {
    if (!USE_MOCKS) {
      try {
        const liveReq = await api<MentorRequest>('/mentors/request', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return liveReq;
      } catch (err) {
        console.warn('Backend /mentors/request error, falling back:', err);
      }
    }
    await delay(500, 800);
    const mentors = getStoredMentors();
    const mentor = mentors.find((m) => m.id === payload.mentorId);

    const newRequest: MentorRequest = {
      id: `req_${Date.now()}`,
      mentorId: payload.mentorId,
      mentorName: mentor ? mentor.name : 'Advisor',
      mentorAvatar: mentor ? mentor.avatar : '',
      founderName: payload.founderName || 'Aarav Patel',
      startupName: payload.startupName || 'NutriFit AI',
      topic: payload.topic,
      message: payload.message,
      proposedTime: payload.proposedTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const requests = getStoredRequests();
    requests.unshift(newRequest);
    localStorage.setItem(MENTOR_REQUESTS_KEY, JSON.stringify(requests));

    return newRequest;
  },

  async getRequests(): Promise<MentorRequest[]> {
    if (!USE_MOCKS) {
      try {
        const liveReqs = await api<MentorRequest[]>('/mentors/requests/all');
        if (liveReqs && liveReqs.length > 0) return liveReqs;
      } catch (err) {
        console.warn('Backend /mentors/requests/all error, falling back:', err);
      }
    }
    await delay(400, 600);
    return getStoredRequests();
  },

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'declined' | 'completed'
  ): Promise<MentorRequest[]> {
    if (!USE_MOCKS) {
      try {
        const updated = await api<MentorRequest[]>(`/mentors/requests/${requestId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        return updated;
      } catch (err) {
        console.warn(`Backend /mentors/requests/${requestId}/status error:`, err);
      }
    }
    await delay(300, 500);
    const requests = getStoredRequests();
    const target = requests.find((r) => r.id === requestId);
    if (target) {
      target.status = status;
      localStorage.setItem(MENTOR_REQUESTS_KEY, JSON.stringify(requests));
    }
    return requests;
  },
};
