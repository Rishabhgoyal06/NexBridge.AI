import { Idea, ValidationAgent } from '@/types';
import { demoIdea } from './mockData';
import { delay, api, USE_MOCKS } from '@/lib/http';
import { synthesizeIdea } from './ideaSynthesizer';

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
    await delay(200, 400);
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
    await delay(150, 300);
    const ideas = getStoredIdeas();
    const found = ideas.find((i) => i.id === id);
    if (found) return found;

    if (id === 'idea_gym_meal_planner' || id === 'idea_nutrifit_ai') {
      return demoIdea;
    }

    // Resilient fallback: synthesize valid venture so navigation never fails
    return synthesizeIdea({
      id,
      title: 'Active Venture Concept',
      description: 'Autonomous venture concept undergoing multi-agent analysis and validation.',
    });
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
        console.warn('Backend /ideas/validate error, falling back to dynamic synthesizer:', err);
      }
    }
    await delay(300, 600);
    const ideas = getStoredIdeas();
    const newIdea = synthesizeIdea(input);
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
        // Generate initial blueprint
        const preview = synthesizeIdea({ ...ideaInput, id: targetId });

        // Mark all 5 agents as running initially in UI
        if (onAgentUpdate) {
          preview.agents.forEach((a) => {
            onAgentUpdate({ ...a, status: 'running' }, false);
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
        console.warn('Backend live validation error, engaging dynamic domain synthesizer:', err);
      }
    }

    // Dynamic Synthesis Engine (Fully tailored to user's title, description, category, and targetMarket)
    const synthesized = synthesizeIdea(ideaInput);

    // Stream progressive agent updates to UI with realistic sequential completion
    const agentPromises = synthesized.agents.map(async (finalAgent, index) => {
      const runtime = 550 + index * 320 + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, runtime));
      if (onAgentUpdate) {
        onAgentUpdate(finalAgent, true);
      }
      return finalAgent;
    });

    await Promise.all(agentPromises);

    const ideas = getStoredIdeas();
    ideas.unshift(synthesized);
    saveIdeas(ideas);

    return synthesized;
  },

  // Alias for backwards compatibility
  simulateParallelValidation(
    ideaInput: { title: string; description: string; targetMarket?: string; tagline?: string },
    onAgentUpdate?: (agent: ValidationAgent, isDone: boolean) => void
  ): Promise<Idea> {
    return this.runValidation(ideaInput, onAgentUpdate);
  },
};
