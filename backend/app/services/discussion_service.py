import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
from app.llm import call_gemini_structured
from app.models import Idea, ValidationAgent
from app.db import execute

class DiscussionReply(BaseModel):
    reply: str
    suggested_follow_ups: List[str] = []
    score_note: Optional[str] = None

AGENT_PERSONAS = {
    "Market Analyst": {
        "title": "Autonomous Market Analyst",
        "focus": "Total addressable market (TAM), ICP customer demand, price sensitivity, and beachhead customer acquisition channels.",
        "tone": "Quantitative, market-driven, customer-centric, and focused on willingness-to-pay benchmarks.",
        "default_starters": [
            "How can we test buyer willingness-to-pay before building the full product?",
            "Which beachhead distribution channel will yield the lowest blended CAC?",
            "Can you break down our addressable TAM in Indian Rupee equivalents?"
        ]
    },
    "Competitor Researcher": {
        "title": "Moat & Landscape Researcher",
        "focus": "Direct and indirect competitors, defensibility thesis, network effects, high switching costs, and counter-positioning.",
        "tone": "Strategic, adversarial, defensive, and focused on uncopiable advantages.",
        "default_starters": [
            "What stops a well-funded incumbent from cloning our core features in 3 months?",
            "How do we engineer structural switching costs into the user workflow from Day 1?",
            "What is our unfair distribution advantage against legacy tools?"
        ]
    },
    "Revenue Critic": {
        "title": "Unit Economics & Monetization Critic",
        "focus": "LTV:CAC dynamics, gross margins, payback velocity, churn sensitivities, and localized pricing tiers.",
        "tone": "Financially rigorous, pragmatic, spreadsheet-minded, and margin-conscious.",
        "default_starters": [
            "How can we elevate our LTV:CAC ratio above 4.0x within our target segment?",
            "Are our proposed pricing tiers realistic for our customer profile?",
            "How can we structure upfront annual contracts to create negative working capital?"
        ]
    },
    "Technical Architect": {
        "title": "System Architect & Technical Feasibility Lead",
        "focus": "Cloud-native infrastructure, latency budgets, API rate limits, database scalability, edge vs cloud compute, and AI inference costs.",
        "tone": "Engineering-first, architecture-focused, performance-obsessed, and reliability-driven.",
        "default_starters": [
            "What are our primary technical bottlenecks and latency budget risks?",
            "How much will AI model inference cost per daily active user at scale?",
            "Should we build this with microservices or a monolithic async framework?"
        ]
    },
    "Skeptic": {
        "title": "Pre-Mortem Failure Analyst",
        "focus": "Brutal pre-mortem failure modes, Day-30 habit decay cliffs, user friction drop-offs, compliance hazards, and retention drop-offs.",
        "tone": "Constructively brutal, pre-mortem interrogator, skeptical, and focused on unvarnished failure modes.",
        "default_starters": [
            "How can we defeat the typical 28-day user habit decay cliff?",
            "What is the single most dangerous unverified assumption in our business model?",
            "What qualitative early warning signals would indicate we need to pivot?"
        ]
    }
}


async def process_agent_discussion(
    idea: Idea,
    agent_name: str,
    user_message: str,
    sub_parameter: Optional[str] = None,
    history: List[dict] = []
) -> dict:
    """
    Executes an in-depth follow-up advisory discussion with a specific validation agent
    about the startup's sub-parameters, risks, metrics, and architecture.
    """
    # 1. Locate the agent
    target_agent: Optional[ValidationAgent] = None
    for ag in idea.agents:
        if ag.name.lower() == agent_name.lower() or ag.name.split()[0].lower() == agent_name.split()[0].lower():
            target_agent = ag
            break

    persona_info = AGENT_PERSONAS.get(target_agent.name if target_agent else agent_name, {
        "title": f"Autonomous {agent_name}",
        "focus": "Venture architecture and validation criteria.",
        "tone": "Rigorous, analytical, and strategic.",
        "default_starters": ["What is the biggest risk here?", "How can we optimize this parameter?"]
    })

    score = target_agent.score if target_agent else 75
    verdict = target_agent.verdict if target_agent else "Validated evaluation"
    analysis = target_agent.detailed_analysis if target_agent else ""
    findings = target_agent.key_findings if target_agent else []
    concerns = target_agent.concerns if target_agent else []

    sub_param_context = f"\nACTIVE SUB-PARAMETER IN FOCUS: {sub_parameter}" if sub_parameter else ""

    system_instruction = f"""You are the {persona_info['title']} for '{idea.title}' on NexBridge.ai.
STARTUP CONTEXT:
- Title: {idea.title}
- Category: {idea.category}
- Target Segment: {idea.target_market}
- Description: {idea.description}

YOUR EVALUATION OF THIS VENTURE:
- Your Conviction Score: {score}/100
- Your Executive Verdict: "{verdict}"
- Key Findings: {json.dumps(findings)}
- Flagged Concerns / Vulnerabilities: {json.dumps(concerns)}
{sub_param_context}

YOUR CORE EXPERTISE & ROLE:
{persona_info['focus']}

TONE & MANDATE:
Speak strictly in the first-person as this specific agent. Be {persona_info['tone']}
Engage in a deep, rigorous, back-and-forth advisory discussion with the founder.
Do NOT give generic startup cliches. Reference the specific product mechanisms of '{idea.title}' and the realities of {idea.target_market}.
If the founder proposes a smart mitigation or counter-strategy, acknowledge its validity and explain how to execute it. If it is flawed, constructively dissect why and offer a stronger alternative.
Provide 2-3 specific, punchy follow-up questions the founder can ask next."""

    # Format conversation history
    formatted_history = []
    for h in history[-8:]:
        sender_label = "FOUNDER" if h.get("sender") == "user" else agent_name.upper()
        formatted_history.append(f"{sender_label}: {h.get('content', '')}")
    history_str = "\n".join(formatted_history) if formatted_history else "No prior discussion in this thread."

    prompt = f"""DISCUSSION THREAD HISTORY:
{history_str}

FOUNDER'S CURRENT FOLLOW-UP MESSAGE:
"{user_message}"

Respond directly and thoroughly to the founder as the {persona_info['title']}.
Return strictly valid JSON with:
- "reply": (string, 120-220 words, structured with strategic depth and bullet points where helpful)
- "suggested_follow_ups": (list of 2-3 short, relevant follow-up questions the founder can ask you next)
- "score_note": (optional string if the founder's idea or mitigation would boost your conviction score)"""

    # High quality domain-tailored fallback
    fallback_reply = _generate_fallback_agent_reply(
        agent_name=target_agent.name if target_agent else agent_name,
        idea=idea,
        user_message=user_message,
        sub_parameter=sub_parameter
    )

    try:
        data = await call_gemini_structured(
            prompt=prompt,
            pydantic_cls=DiscussionReply,
            inputs={"title": idea.title, "agent": agent_name, "userMessage": user_message},
            system_instruction=system_instruction,
            fallback_data=fallback_reply,
            timeout_seconds=20.0
        )
        reply_text = data.reply
        starters = data.suggested_follow_ups or persona_info["default_starters"]
        score_note = data.score_note
    except Exception as e:
        print(f"⚠️ Agent discussion call error: {e}")
        reply_text = fallback_reply["reply"]
        starters = fallback_reply["suggested_follow_ups"]
        score_note = fallback_reply.get("score_note")

    timestamp = datetime.now().strftime("%I:%M %p")
    msg_id = f"msg_{uuid.uuid4().hex[:8]}"

    # Persist message to discussion record in idea object
    discussion_entry = {
        "id": msg_id,
        "sender": "agent",
        "agentName": target_agent.name if target_agent else agent_name,
        "subParameter": sub_parameter or "General Follow-Up",
        "content": reply_text,
        "timestamp": timestamp,
        "suggestedFollowUps": starters,
        "scoreNote": score_note
    }

    # Save to DB asynchronously
    try:
        user_entry = {
            "id": f"msg_user_{uuid.uuid4().hex[:8]}",
            "sender": "user",
            "agentName": target_agent.name if target_agent else agent_name,
            "subParameter": sub_parameter or "General Follow-Up",
            "content": user_message,
            "timestamp": timestamp
        }
        await _save_discussion_to_db(idea.id, target_agent.name if target_agent else agent_name, user_entry, discussion_entry)
    except Exception as db_err:
        print(f"Notice on persisting discussion: {db_err}")

    return discussion_entry


async def _save_discussion_to_db(idea_id: str, agent_name: str, user_entry: dict, agent_entry: dict):
    """Appends messages to the public.ideas agent_discussions JSONB store"""
    try:
        # Load existing discussions
        from app.db import fetch_one
        row = await fetch_one("SELECT agent_discussions FROM public.ideas WHERE id = $1", idea_id)
        existing = {}
        if row and row.get("agent_discussions"):
            raw = row["agent_discussions"]
            existing = json.loads(raw) if isinstance(raw, str) else raw

        thread = existing.get(agent_name, [])
        thread.append(user_entry)
        thread.append(agent_entry)
        existing[agent_name] = thread[-30:] # keep recent 30 messages per agent

        await execute(
            "UPDATE public.ideas SET agent_discussions = $1 WHERE id = $2",
            json.dumps(existing),
            idea_id
        )
    except Exception as e:
        print(f"⚠️ Error saving discussion to DB: {e}")


def _generate_fallback_agent_reply(agent_name: str, idea: Idea, user_message: str, sub_parameter: Optional[str]) -> dict:
    """Generates an intelligent, context-aware fallback response tailored to the agent's persona."""
    title = idea.title
    market = idea.target_market
    cat = idea.category
    lower = user_message.lower()

    if "market" in agent_name.lower():
        reply = (
            f"From my perspective as your **Market Analyst**, here is how to de-risk demand for **{title}** in **{market}**:\n\n"
            f"• **Pre-Building Willingness to Pay:** Instead of running surveys, launch a high-intent waitlist page with 2 concrete pricing tiers (₹499/mo and ₹1,499/mo). If users enter card credentials or UPI intent to pre-reserve pilot access, you validate hard budget allocation.\n\n"
            f"• **Beachhead Concentration:** Do not spread marketing thin across broad social ads. Anchor on vertical {market} communities, Discord hubs, and practitioner groups where members actively complain about manual alternatives.\n\n"
            f"• **Unit Demand Reality:** Your ICP is willing to pay because automating disconnected workflows replaces 6–10 hours of weekly labor overhead."
        )
        starters = [
            "What conversion rate should we target on our pilot waitlist?",
            "How do we structure localized pricing tiers for tier-1 Indian metros?",
            "What adjacent segments can we expand into after conquering this beachhead?"
        ]
        score_note = "+3 points if you achieve >15% pre-reservation conversion on cold traffic."

    elif "skeptic" in agent_name.lower():
        reply = (
            f"As the **Skeptic**, my primary concern remains **Day-14 to Day-30 habit decay** for **{title}**.\n\n"
            f"• **The Activation Cliff:** Over 65% of software tools suffer severe churn because onboarding requires cognitive friction. If a user in {market} doesn't experience tangible, magical value in their first 120 seconds, they will abandon the product.\n\n"
            f"• **Zero-Friction Counter-Strategy:** Eliminate manual configuration. Pre-populate default templates, connect existing data sources with 1-click OAuth, and deliver an automated summary digest directly to their inbox/WhatsApp on Day 3.\n\n"
            f"• **Early Warning Metrics:** Track *unprompted weekly active workflows* rather than mere logins. If logins drop below 3 times weekly per user, trigger proactive intervention immediately."
        )
        starters = [
            "How can we get time-to-first-value under 60 seconds?",
            "What automated re-engagement triggers have the lowest unsubscribes?",
            "How should we conduct churn exit interviews to uncover real blockers?"
        ]
        score_note = "+5 points if onboarding is tested with zero manual data entry."

    elif "competitor" in agent_name.lower():
        reply = (
            f"From a **Competitive Landscape & Moat** standpoint, legacy tools in {cat} have brand awareness but suffer from massive technical debt.\n\n"
            f"• **The Incumbent Trap:** Established players treat {market} as a passive database entry problem. They will attempt to bolt on superficial AI wrappers, but their underlying architecture cannot deliver closed-loop autonomous execution.\n\n"
            f"• **Building Structural Switching Costs:** Make **{title}** the authoritative system of record for operational workflows. Once proprietary user preferences and workflow telemetry are stored in your platform, migrating away becomes painful and disruptive.\n\n"
            f"• **Counter-Positioning:** Price transparently and deliver outcomes 5x faster than legacy enterprise retainers."
        )
        starters = [
            "How do we defend against well-funded venture-backed fast-followers?",
            "Can we build proprietary feedback data loops that widen our moat over time?",
            "What strategic distribution partnerships can lock out competitors?"
        ]
        score_note = "+4 points if workflow integration creates a verifiable data moat."

    elif "revenue" in agent_name.lower():
        reply = (
            f"As your **Revenue Critic**, our mandate is ensuring sustainable unit economics with an **LTV:CAC ratio above 3.5x**.\n\n"
            f"• **Payback Velocity:** In {market}, you cannot afford customer acquisition payback periods exceeding 4.5 months. Structure quarterly and annual upfront plans discounted by 20% to capture cash immediately.\n\n"
            f"• **Software Gross Margins:** Maintain gross margins above 75% by ensuring third-party API and inference costs remain under 6% of Monthly Recurring Revenue (MRR).\n\n"
            f"• **Pricing Power:** Never compete on being the cheapest option. Anchor your price against the actual cost of human labor and contractor retainers that {title} automates."
        )
        starters = [
            "What is the optimal price point for our initial self-serve tier in INR?",
            "How do we simulate churn impact on our 12-month runway?",
            "Should we introduce usage-based metering or stick to flat subscriptions?"
        ]
        score_note = "+4 points if annual upfront cash flow is verified in pilot contracts."

    else: # Technical Architect
        reply = (
            f"From a **Technical Architecture & Scalability** standpoint for **{title}**:\n\n"
            f"• **Async Processing Pipelines:** Keep user-facing endpoints lightning fast (<150ms). Offload heavy AI synthesis, document processing, and vector indexing to background Redis task queues with retry policies.\n\n"
            f"• **Inference Cost Containment:** Implement a 2-tier model architecture. Route standard heuristic checks and classification through ultra-lightweight models (gemini-flash-lite) and invoke heavy models only when multi-step reasoning is required.\n\n"
            f"• **Data Resilience:** Ensure vector embeddings and relational entities are unified in PostgreSQL with pgvector to avoid multi-database synchronization lag."
        )
        starters = [
            "How should we cache repeated AI inferences to slash API costs by 40%?",
            "What is the best vector indexing strategy for sub-50ms search latency?",
            "How do we build fallback retry chains if upstream LLM providers rate-limit us?"
        ]
        score_note = "+3 points if async worker queue and caching architecture are validated."

    return {
        "reply": reply,
        "suggested_follow_ups": starters,
        "score_note": score_note
    }
