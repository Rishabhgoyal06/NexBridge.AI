import json
import uuid
from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.llm import call_gemini_structured
from app.models import ChatMessage, ChatSendPayload

class ChatReply(BaseModel):
    content: str
    quick_actions: List[str]

async def process_chat_message(payload: ChatSendPayload) -> ChatMessage:
    """
    Context-aware global chatbot:
    POST /chat with page context in the system prompt; last 10 messages of history.
    """
    msg = payload.message
    ctx = payload.context
    history = payload.history[-10:] if payload.history else []

    system_instruction = (
        f"You are the NexBridge.ai Executive Co-Pilot, an elite AI venture studio advisor.\n"
        f"CURRENT PAGE CONTEXT:\n"
        f"- Page Key: {ctx.page_key}\n"
        f"- Title: {ctx.title}\n"
        f"- Summary: {ctx.summary}\n"
        f"- Active Data: {json.dumps(ctx.data, default=str) if ctx.data else 'None'}\n\n"
        f"Tone: Crisp, executive, mathematically grounded, proactive, and strategic. "
        f"Provide high-conviction answers and include 2 to 3 relevant, highly actionable quick actions."
    )

    # Contextual fallback reply
    lower = msg.lower()
    if ctx.page_key in ("idea_validation", "founder_dashboard"):
        if "skeptic" in lower or "risk" in lower or "churn" in lower:
            fallback_text = "The Skeptic agent scored this at 59/100, citing that **71% of fitness nutrition users quit within the first 28 days**. Because manual weighing causes rapid fatigue, your primary defense is zero-friction automation: syncing Apple Watch/Whoop strain to auto-adjust carbs and dispatching grocery ingredients directly via Instacart."
            fallback_actions = ["Mitigate Day-30 Churn", "Review Skeptic Report", "Schedule Marcus Vance"]
        elif "score" in lower or "agent" in lower:
            fallback_text = "Your composite validation score is **78/100 (Strong Signal)** across 5 parallel agents. The highest conviction comes from **Market Demand (84%)** and **Technical Feasibility (82%)**, while the primary drag is the **Skeptic (59%)** over habit compliance."
            fallback_actions = ["View Competitor Moat", "Explore Unit Economics"]
        else:
            fallback_text = f"I am analyzing **{ctx.title}** ({ctx.summary}). With an active sprint on NutriFit AI, would you like me to stress-test your pricing model, prepare outreach for candidate Elena Rostova, or book a consultation with Marcus Vance?"
            fallback_actions = ["Ask about unit economics", "View matched candidates", "Analyze competitors"]
    elif ctx.page_key == "idea_competitors":
        fallback_text = "Against **MyFitnessPal** and **MacroFactor**, your primary moat is *closed-loop execution*. MyFitnessPal is burdened by legacy manual logging. MacroFactor calculates expenditure but leaves the user to cook and shop. NutriFit bridges the gap with automated grocery delivery and biometric carb-cycling."
        fallback_actions = ["Compare Pricing", "Draft Moat Summary"]
    elif ctx.page_key == "idea_revenue":
        fallback_text = "Your unit economics indicate a **3.23x LTV:CAC** ($122.90 LTV vs $38 CAC) with a **3.1 month payback period**. Adding grocery affiliate fees (~$4.20/order) lifts gross margins to 78.4%. The biggest sensitivity is keeping on-device CoreML vision inference costs under $0.008 per scan."
        fallback_actions = ["Simulate 10% Churn Spike", "View Pricing Tiers"]
    elif ctx.page_key == "rejection_report":
        fallback_text = "For the **HyperScale Labs** role, the primary hurdle was kernel-level networking and Raft consensus. You have **3 weeks remaining** before the Nov 7 re-evaluation. Focus on Week 1: building a working eBPF XDP filter that logs TCP round-trip delays, then book a prep call with mentor Marcus Vance."
        fallback_actions = ["Export PDF Report", "Book Marcus Vance", "Review Week 1 Tasks"]
    elif ctx.page_key == "mentors_directory":
        fallback_text = "For consumer fitness and retention, I strongly recommend **Marcus Vance** (ex-VP Product at Peloton & Strava, $250/hr). For nutrition database architecture and USDA grounding, connect with **Sarah Lin** (ex-Chief Architect at MyFitnessPal)."
        fallback_actions = ["Request Marcus Vance", "Request Sarah Lin"]
    elif ctx.page_key == "talent_matches":
        fallback_text = "You have strong 94% alignment with **NutriFit AI** for the Lead Mobile Architect position. They require React Native and HealthKit telemetry syncing, matching your exact prior background."
        fallback_actions = ["Apply to NutriFit AI", "Update Resume"]
    else:
        fallback_text = f"I'm your NexBridge executive co-pilot on **{ctx.title}**. Ask me to analyze market signals, summarize candidate profiles, draft investor updates, or suggest actionable next steps."
        fallback_actions = ["Summarize Page", "Identify Key Risks", "Next Best Action"]

    fallback = {
        "content": fallback_text,
        "quick_actions": fallback_actions
    }

    formatted_history = "\n".join([f"{h.sender.upper()}: {h.content}" for h in history])
    prompt = f"CONVERSATION HISTORY:\n{formatted_history}\n\nUSER MESSAGE:\n{msg}"

    try:
        reply: ChatReply = await call_gemini_structured(
            prompt=prompt,
            pydantic_cls=ChatReply,
            inputs={"context": ctx.model_dump(), "userMessage": msg},
            system_instruction=system_instruction,
            fallback_data=fallback,
            timeout_seconds=15.0
        )
        content = reply.content
        actions = reply.quick_actions
    except Exception:
        content = fallback["content"]
        actions = fallback["quick_actions"]

    now = datetime.now()
    timestamp = now.strftime("%I:%M %p")

    return ChatMessage(
        id=f"chat_{uuid.uuid4().hex[:8]}",
        sender="assistant",
        content=content,
        timestamp=timestamp,
        quick_actions=actions
    )
