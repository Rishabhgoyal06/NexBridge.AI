import { Idea, ValidationAgent } from '@/types';
import { demoIdea } from './mockData';
import { delay, api, USE_MOCKS } from '@/lib/http';

const IDEAS_STORAGE_PREFIX = 'nexbridge_ideas_';

/** Returns a user-scoped localStorage key so each account has isolated idea storage. */
function getIdeasKey(): string {
  // Try to read the stored user profile for an ID, fall back to 'anon'
  try {
    const raw = localStorage.getItem('nexbridge_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return `${IDEAS_STORAGE_PREFIX}${u.id}`;
    }
  } catch {
    // ignore
  }
  return `${IDEAS_STORAGE_PREFIX}anon`;
}

function getStoredIdeas(): Idea[] {
  const key = getIdeasKey();
  const raw = localStorage.getItem(key);
  if (!raw) return []; // New user starts with empty list — no demo seed
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveIdeas(ideas: Idea[]): void {
  localStorage.setItem(getIdeasKey(), JSON.stringify(ideas));
}


export const ideaService = {
  async getIdeas(): Promise<Idea[]> {
    if (!USE_MOCKS) {
      try {
        const liveIdeas = await api<Idea[]>('/ideas');
        if (liveIdeas && liveIdeas.length > 0) return liveIdeas;
      } catch (err) {
        console.warn('Backend /ideas error, falling back:', err);
      }
    }
    await delay(300, 500);
    return getStoredIdeas();
  },

  async getIdeaById(id: string): Promise<Idea> {
    if (!USE_MOCKS) {
      try {
        const liveIdea = await api<Idea>(`/ideas/${id}`);
        if (liveIdea) return liveIdea;
      } catch (err) {
        console.warn(`Backend /ideas/${id} error, falling back:`, err);
      }
    }
    await delay(300, 500);
    const ideas = getStoredIdeas();
    const found = ideas.find((i) => i.id === id);
    return found || null as unknown as Idea;
  },

  async createIdea(input: {
    title: string;
    tagline?: string;
    description: string;
    category?: string;
    targetMarket?: string;
  }): Promise<Idea> {
    if (!USE_MOCKS) {
      try {
        const validated = await api<Idea>('/ideas/validate', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        return validated;
      } catch (err) {
        console.warn('Backend /ideas/validate error, falling back:', err);
      }
    }
    await delay(400, 700);
    const ideas = getStoredIdeas();
    const newIdea: Idea = {
      ...demoIdea,
      id: `idea_${Date.now()}`,
      title: input.title,
      tagline: input.tagline || 'AI Venture',
      description: input.description,
      category: input.category || 'Artificial Intelligence',
      targetMarket: input.targetMarket || 'Tech enthusiasts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'validated',
      score: 76,
    };
    ideas.unshift(newIdea);
    saveIdeas(ideas);
    return newIdea;
  },

  async runValidation(
    ideaInput: { title: string; description: string; targetMarket?: string; tagline?: string; category?: string },
    onAgentUpdate?: (agent: ValidationAgent, isDone: boolean) => void
  ): Promise<Idea> {
    if (!USE_MOCKS) {
      try {
        const targetId = `idea_val_${Date.now()}`;
        // Mark all 5 agents as running initially in UI
        const baseAgents: ValidationAgent[] = JSON.parse(JSON.stringify(demoIdea.agents));
        if (onAgentUpdate) {
          baseAgents.forEach((a) => {
            a.status = 'running';
            onAgentUpdate(a, false);
          });
        }

        // Start backend validation run
        const validationPromise = api<Idea>('/ideas/validate', {
          method: 'POST',
          body: JSON.stringify({ ...ideaInput, id: targetId }),
        });

        // Poll per-agent status while backend executes
        let isComplete = false;
        const seenCompleted = new Set<string>();

        const pollPerAgentStatus = async () => {
          while (!isComplete) {
            await delay(400, 600);
            if (isComplete) break;
            try {
              const runStatus = await api<{ id: string; status: string; agents: ValidationAgent[] }>(
                `/ideas/${targetId}/validation`
              );
              if (runStatus && runStatus.agents) {
                for (const ag of runStatus.agents) {
                  if (ag.status !== 'running' && !seenCompleted.has(ag.name)) {
                    seenCompleted.add(ag.name);
                    onAgentUpdate?.(ag, true);
                  }
                }
              }
            } catch {
              // Ignore polling hiccups
            }
          }
        };

        const pollPromise = pollPerAgentStatus();
        const validated = await validationPromise;
        isComplete = true;
        await pollPromise;

        // Ensure all final agents are reported to UI
        if (onAgentUpdate && validated.agents) {
          validated.agents.forEach((ag) => onAgentUpdate(ag, true));
        }

        // Cache locally for offline resilience
        const ideas = getStoredIdeas();
        ideas.unshift(validated);
        saveIdeas(ideas);

        return validated;
      } catch (err) {
        console.warn('Backend live validation error, engaging mock fallback:', err);
      }
    }

    // Mock Branch
    const baseAgents: ValidationAgent[] = JSON.parse(JSON.stringify(demoIdea.agents));
    baseAgents.forEach((a) => (a.status = 'running'));

    const agentPromises = baseAgents.map(async (agent, index) => {
      const runtime = 700 + index * 350 + Math.random() * 250;
      await new Promise((resolve) => setTimeout(resolve, runtime));
      agent.status = agent.name === 'Skeptic' ? 'flagged' : 'completed';
      if (onAgentUpdate) {
        onAgentUpdate(agent, true);
      }
      return agent;
    });

    await Promise.all(agentPromises);

    const generatedIdea: Idea = {
      ...demoIdea,
      id: `idea_val_${Date.now()}`,
      title: ideaInput.title || 'AI Venture',
      description: ideaInput.description || demoIdea.description,
      targetMarket: ideaInput.targetMarket || demoIdea.targetMarket,
      agents: baseAgents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ideas = getStoredIdeas();
    ideas.unshift(generatedIdea);
    saveIdeas(ideas);

    return generatedIdea;
  },

  // Alias for backwards compatibility
  simulateParallelValidation(
    ideaInput: { title: string; description: string; targetMarket?: string; tagline?: string },
    onAgentUpdate?: (agent: ValidationAgent, isDone: boolean) => void
  ): Promise<Idea> {
    return this.runValidation(ideaInput, onAgentUpdate);
  },
};
