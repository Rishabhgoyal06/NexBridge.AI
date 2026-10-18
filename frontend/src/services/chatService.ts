import { ChatMessage, PageContextType } from '@/types';
import { delay, api, USE_MOCKS } from '@/lib/http';

export interface ChatSendPayload {
  message: string;
  context: PageContextType;
  history: ChatMessage[];
}

export const chatService = {
  async sendMessage(payload: ChatSendPayload): Promise<ChatMessage> {
    if (!USE_MOCKS) {
      try {
        const liveResponse = await api<ChatMessage>('/chat', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (liveResponse) return liveResponse;
      } catch (err) {
        console.warn('Backend /chat error, falling back to local synthesis:', err);
      }
    }

    await delay(450, 850);
    const { message, context } = payload;
    const lower = message.toLowerCase();

    let reply = '';
    const quickActions: string[] = [];

    if (context.pageKey === 'idea_validation' || context.pageKey === 'founder_dashboard') {
      if (lower.includes('skeptic') || lower.includes('risk') || lower.includes('churn')) {
        reply = `The Skeptic agent identified that the primary vulnerability for **${context.title}** is day-30 user habit decay and onboarding friction. To counter this, ensure time-to-first-value is under 3 minutes and implement automated recurring value notifications.`;
        quickActions.push('Mitigate Day-30 Churn', 'Review Skeptic Report', 'Defensive Moat Strategy');
      } else if (lower.includes('score') || lower.includes('agents')) {
        reply = `Your composite validation score for **${context.title}** reflects strong conviction across market demand and technical feasibility, with the primary optimization area centered on early cohort retention.`;
        quickActions.push('View Competitor Moat', 'Explore Unit Economics');
      } else if (lower.includes('market') || lower.includes('demand') || lower.includes('tam')) {
        reply = `Market analysis for **${context.title}** demonstrates high customer pull and willingness to pay. Target buyers report acute daily friction with unautomated alternatives, supporting tiered SaaS subscription pricing.`;
        quickActions.push('Review TAM Sizing', 'Explore GTM Beachhead');
      } else {
        reply = `I am analyzing **${context.title}** (${context.summary}). Would you like me to stress-test your unit economics, evaluate competitor moats, or draft targeted candidate outreach messages?`;
        quickActions.push('Ask about unit economics', 'View matched candidates', 'Analyze competitors');
      }
    } else if (context.pageKey === 'idea_competitors') {
      reply = `Against direct incumbents in this category, **${context.title}**'s primary structural moat is *closed-loop automated execution*. While legacy alternatives act as passive tools, your platform embeds directly into daily operating workflows with high switching costs.`;
      quickActions.push('Compare Pricing Tiers', 'Draft Moat Summary');
    } else if (context.pageKey === 'idea_revenue') {
      reply = `Your unit economics for **${context.title}** indicate a sustainable **3.2x+ LTV:CAC** with a projected sub-4 month payback period. Software gross margins exceeding 74% allow efficient capital recycling into growth.`;
      quickActions.push('Simulate 10% Churn Spike', 'View Pricing Tiers');
    } else if (context.pageKey === 'rejection_report') {
      reply = `For your technical debrief on **${context.title}**, prioritize hands-on architecture milestone deliverables and schedule 1-on-1 advisor sessions to accelerate re-evaluation readiness.`;
      quickActions.push('Export PDF Report', 'Book Advisor Session', 'Review Milestone Tasks');
    } else if (context.pageKey === 'mentors_directory') {
      reply = `Based on your venture goals for **${context.title}**, connect with experienced operators specializing in category GTM, product-led growth, and scalable cloud architectures.`;
      quickActions.push('Request Advisor Call', 'Browse Directory');
    } else if (context.pageKey === 'talent_matches') {
      reply = `Review candidates aligned with the core engineering and design roles identified in **${context.title}**'s system plan.`;
      quickActions.push('Review Candidates', 'Send Message');
    } else {
      reply = `I'm your NexBridge executive co-pilot on **${context.title}**. Ask me to analyze market signals, summarize candidate profiles, draft investor updates, or suggest actionable next steps.`;
      quickActions.push('Summarize Page', 'Identify Key Risks', 'Next Best Action');
    }

    return {
      id: `chat_${Date.now()}`,
      sender: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions,
    };
  },
};
