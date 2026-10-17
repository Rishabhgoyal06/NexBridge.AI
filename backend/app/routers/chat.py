from fastapi import APIRouter
from app.models import ChatMessage, ChatSendPayload
from app.services.chat_service import process_chat_message

router = APIRouter(prefix="", tags=["Chat"])

@router.post("/chat", response_model=ChatMessage)
async def chat(payload: ChatSendPayload):
    """Context-aware executive co-pilot chat taking current page route, active data, and conversational history"""
    return await process_chat_message(payload)
