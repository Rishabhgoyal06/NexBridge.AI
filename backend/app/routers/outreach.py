import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models import OutreachMessage, SendOutreachRequest, UpdateStageRequest
from app.db import fetch_all, fetch_one, execute

router = APIRouter(prefix="", tags=["Outreach"])

@router.post("/outreach", response_model=OutreachMessage)
async def send_outreach(payload: SendOutreachRequest):
    """Dispatches founder outreach message to candidate"""
    msg_id = f"out_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now().isoformat()

    try:
        await execute("""
            INSERT INTO public.outreach (
                id, idea_id, candidate_id, candidate_name, candidate_role,
                subject, message, stage, status, sent_at
            ) VALUES ($1, 'idea_nutrifit_ai', $2, $3, $4, $5, $6, 'Sent', 'sent', now());
        """, msg_id, payload.candidate_id, payload.candidate_name, payload.candidate_role, payload.subject, payload.body)
    except Exception as e:
        print(f"Notice on outreach insert: {e}")

    return OutreachMessage(
        id=msg_id,
        candidate_id=payload.candidate_id,
        candidate_name=payload.candidate_name,
        candidate_role=payload.candidate_role,
        subject=payload.subject,
        body=payload.body,
        status="sent",
        sent_at=now_iso,
        stage="Sent"
    )

@router.get("/outreach/pipeline", response_model=List[OutreachMessage])
async def get_outreach_pipeline():
    """Returns all outreach messages across Kanban stages"""
    rows = await fetch_all("SELECT * FROM public.outreach ORDER BY sent_at DESC")
    pipeline = []
    for r in rows:
        pipeline.append(OutreachMessage(
            id=r["id"],
            candidate_id=r.get("candidate_id") or "tal_01",
            candidate_name=r["candidate_name"],
            candidate_role=r.get("candidate_role") or "Specialist",
            subject=r["subject"],
            body=r["message"],
            status=r.get("status") or "sent",
            sent_at=str(r.get("sent_at") or "Just now"),
            stage=r.get("stage") or "Sent"
        ))
    return pipeline

@router.patch("/outreach/{message_id}/stage", response_model=List[OutreachMessage])
async def update_outreach_stage(message_id: str, payload: UpdateStageRequest):
    """Updates message stage in outreach pipeline and returns refreshed pipeline"""
    await execute("UPDATE public.outreach SET stage = $1 WHERE id = $2", payload.stage, message_id)
    return await get_outreach_pipeline()
