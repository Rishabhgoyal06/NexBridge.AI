export interface ChatPayload {
  message: string;
  context: {
    pageKey: string;
    title: string;
    summary: string;
    data?: any;
  };
  history?: { sender: string; content: string }[];
}

export const chatService = {
  async processMessage(payload: ChatPayload) {
    const { message, context } = payload;
    const lower = message.toLowerCase();

    let reply = '';
    const quickActions: string[] = [];

    // Contextual heuristics based on pageKey and user question
    if (context.pageKey === 'idea_validation' || context.pageKey === 'founder_dashboard') {
      if (lower.includes('skeptic') || lower.includes('risk') || lower.includes('churn')) {
        reply = `The Skeptic agent scored this at 59/100, citing that **71% of fitness nutrition users quit within the first 28 days**. Because manual weighing causes rapid fatigue, your primary defense is zero-friction automation: syncing Apple Watch/Whoop strain to auto-adjust carbs and dispatching grocery ingredients directly via Instacart.`;
        quickActions.push('Mitigate Day-30 Churn', 'Review Skeptic Report', 'Schedule Marcus Vance');
      } else if (lower.includes('score') || lower.includes('agents')) {
        reply = `Your composite validation score is **78/100 (Strong Signal)** across 5 parallel agents. The highest conviction comes from **Market Demand (84%)** and **Technical Feasibility (82%)**, while the primary drag is the **Skeptic (59%)** over long-term habit compliance.`;
        quickActions.push('View Competitor Moat', 'Explore Unit Economics');
      } else {
        reply = `I am analyzing **${context.title}** (${context.summary}). With an active sprint on NutriFit AI, would you like me to stress-test your pricing model, prepare outreach for candidate Elena Rostova, or book a consultation with Marcus Vance?`;
        quickActions.push('Ask about unit economics', 'View matched candidates', 'Analyze competitors');
      }
    } else if (context.pageKey === 'idea_competitors') {
      reply = `Against **MyFitnessPal** and **MacroFactor**, your primary moat is *closed-loop execution*. MyFitnessPal is burdened by legacy manual logging with inaccurate user databases. MacroFactor calculates expenditure but leaves the user to cook and shop. NutriFit bridges the gap with automated grocery delivery and biometric carb-cycling.`;
      quickActions.push('Compare Pricing', 'Draft Moat Summary');
    } else if (context.pageKey === 'idea_revenue') {
      reply = `Your unit economics indicate a **3.23x LTV:CAC** ($122.90 LTV vs $38 CAC) with a **3.1 month payback period**. Adding grocery affiliate fees (~$4.20/order) lifts gross margins to 78.4%. The biggest sensitivity is keeping on-device CoreML vision inference costs under $0.008 per scan.`;
      quickActions.push('Simulate 10% Churn Spike', 'View Pricing Tiers');
    } else if (context.pageKey === 'rejection_report') {
      reply = `For the **HyperScale Labs** role, the primary hurdle was kernel-level networking and Raft consensus. You have **3 weeks remaining** before the Nov 7 re-evaluation. Focus on Week 1: building a working eBPF XDP filter that logs TCP round-trip delays, then book a prep call with mentor Marcus Vance.`;
      quickActions.push('Export PDF Report', 'Book Marcus Vance', 'Review Week 1 Tasks');
    } else if (context.pageKey === 'mentors_directory') {
      reply = `For consumer fitness and retention, I strongly recommend **Marcus Vance** (ex-VP Product at Peloton & Strava, $250/hr). For nutrition database architecture and USDA grounding, connect with **Sarah Lin** (ex-Chief Architect at MyFitnessPal).`;
      quickActions.push('Request Marcus Vance', 'Request Sarah Lin');
    } else if (context.pageKey === 'talent_matches') {
      reply = `You have strong 94% alignment with **NutriFit AI** for the Lead Mobile Architect position. They require React Native and HealthKit telemetry syncing, matching your exact prior background.`;
      quickActions.push('Apply to NutriFit AI', 'Update Resume');
    } else {
      reply = `I'm your NexBridge executive co-pilot on **${context.title}**. Ask me to analyze market signals, summarize candidate profiles, draft investor updates, or suggest actionable next steps.`;
      quickActions.push('Summarize Page', 'Identify Key Risks', 'Next Best Action');
    }

    return {
      id: `chat_${Date.now()}`,
      sender: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions
    };
  }
};
