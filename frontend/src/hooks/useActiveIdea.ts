import { useState, useEffect } from 'react';
import { ideaService } from '@/services/ideaService';

/**
 * Returns the ID of the user's most recent idea, or null if they have none.
 * Uses ideaService so mock/real modes are both handled.
 */
export function useActiveIdea() {
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ideaService.getIdeas().then((ideas) => {
      if (cancelled) return;
      // Filter out the seeded demo idea for fresh users (idea_gym_meal_planner stored in LS)
      // We still show it if it's the only option, so founders always have something to navigate to.
      setActiveIdeaId(ideas.length > 0 ? ideas[0].id : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { activeIdeaId, loading };
}
