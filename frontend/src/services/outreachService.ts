import { Candidate, OutreachMessage } from '@/types';
import { demoCandidates, demoOutreachPipeline } from './mockData';
import { delay, api, USE_MOCKS } from '@/lib/http';

const CANDIDATES_KEY = 'nexbridge_candidates';
const PIPELINE_KEY = 'nexbridge_outreach_pipeline';

/** Returns a user-scoped localStorage key so each account has isolated outreach storage. */
function getUserId(): string {
  try {
    const raw = localStorage.getItem('nexbridge_user') || localStorage.getItem('nexbridge_auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return u.id;
    }
  } catch {}
  return 'anon';
}

function getCandidatesKey() {
  return `${CANDIDATES_KEY}_${getUserId()}`;
}

function getPipelineKey() {
  return `${PIPELINE_KEY}_${getUserId()}`;
}

function getStoredCandidates(): Candidate[] {
  const raw = localStorage.getItem(getCandidatesKey());
  if (!raw) {
    localStorage.setItem(getCandidatesKey(), JSON.stringify(demoCandidates));
    return demoCandidates;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return demoCandidates;
  }
}

function getStoredPipeline(): OutreachMessage[] {
  const raw = localStorage.getItem(getPipelineKey());
  if (!raw) {
    localStorage.setItem(getPipelineKey(), JSON.stringify(demoOutreachPipeline));
    return demoOutreachPipeline;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return demoOutreachPipeline;
  }
}

export const outreachService = {
  async getCandidates(roleId?: string): Promise<Candidate[]> {
    if (!USE_MOCKS) {
      try {
        const liveList = await api<Candidate[]>('/candidates');
        if (liveList && liveList.length > 0) {
          if (roleId) return liveList.filter((c) => c.appliedJobRoleId === roleId);
          return liveList;
        }
      } catch (err) {
        console.warn('Backend /candidates error, falling back:', err);
      }
    }
    await delay(400, 700);
    const list = getStoredCandidates();
    if (roleId) {
      return list.filter((c) => c.appliedJobRoleId === roleId);
    }
    return list;
  },

  async getCandidateById(candidateId: string): Promise<Candidate | undefined> {
    if (!USE_MOCKS) {
      try {
        const liveCand = await api<Candidate>(`/candidates/${candidateId}`);
        if (liveCand) return liveCand;
      } catch (err) {
        console.warn(`Backend /candidates/${candidateId} error:`, err);
      }
    }
    await delay(300, 500);
    const list = getStoredCandidates();
    return list.find((c) => c.id === candidateId);
  },

  async sendOutreach(candidateId: string, subject: string, body: string): Promise<OutreachMessage> {
    if (!USE_MOCKS) {
      try {
        const candidates = await this.getCandidates();
        const cand = candidates.find((c) => c.id === candidateId);
        const newMessage = await api<OutreachMessage>('/outreach', {
          method: 'POST',
          body: JSON.stringify({
            candidateId,
            candidateName: cand ? cand.name : 'Elena Rostova',
            candidateRole: cand ? cand.role : 'Staff Mobile Architect',
            subject,
            body,
          }),
        });
        return newMessage;
      } catch (err) {
        console.warn('Backend /outreach POST error, falling back:', err);
      }
    }
    await delay(500, 800);
    const candidates = getStoredCandidates();
    const candidate = candidates.find((c) => c.id === candidateId);

    const newMessage: OutreachMessage = {
      id: `out_${Date.now()}`,
      candidateId,
      candidateName: candidate ? candidate.name : 'Unknown Candidate',
      candidateRole: candidate ? candidate.role : 'Specialist',
      subject,
      body,
      status: 'sent',
      sentAt: new Date().toISOString(),
      stage: 'Sent',
    };

    if (candidate) {
      candidate.outreachStatus = 'contacted';
      localStorage.setItem(getCandidatesKey(), JSON.stringify(candidates));
    }

    const pipeline = getStoredPipeline();
    pipeline.unshift(newMessage);
    localStorage.setItem(getPipelineKey(), JSON.stringify(pipeline));

    return newMessage;
  },

  async getPipeline(): Promise<OutreachMessage[]> {
    if (!USE_MOCKS) {
      try {
        const livePipe = await api<OutreachMessage[]>('/outreach/pipeline');
        if (livePipe && livePipe.length > 0) return livePipe;
      } catch (err) {
        console.warn('Backend /outreach/pipeline error, falling back:', err);
      }
    }
    await delay(400, 600);
    return getStoredPipeline();
  },

  async updateStage(
    messageId: string,
    newStage: 'Drafts' | 'Sent' | 'In Conversation' | 'Offer / Hired'
  ): Promise<OutreachMessage[]> {
    if (!USE_MOCKS) {
      try {
        const updated = await api<OutreachMessage[]>(`/outreach/${messageId}/stage`, {
          method: 'PATCH',
          body: JSON.stringify({ stage: newStage }),
        });
        return updated;
      } catch (err) {
        console.warn(`Backend /outreach/${messageId}/stage error, falling back:`, err);
      }
    }
    await delay(300, 500);
    const pipeline = getStoredPipeline();
    const target = pipeline.find((m) => m.id === messageId);
    if (target) {
      target.stage = newStage;
      localStorage.setItem(getPipelineKey(), JSON.stringify(pipeline));
    }
    return pipeline;
  },
};
