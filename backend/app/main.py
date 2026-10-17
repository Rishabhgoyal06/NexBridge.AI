from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.db import init_db_pool, close_db_pool, check_db_health
from app.llm import is_ai_configured
from app.routers import auth, ideas, candidates, outreach, talent, mentors, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB connection pool
    await init_db_pool()
    yield
    # Shutdown: Close DB connection pool
    await close_db_pool()

app = FastAPI(
    title="NexBridge.ai API",
    description="Executive Precision AI Venture Studio Backend API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health checks
@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health_check():
    db_ok = await check_db_health()
    ai_ok = is_ai_configured()
    return {
        "status": "healthy",
        "service": "NexBridge.ai Backend",
        "version": "2.0.0",
        "database": "connected" if db_ok else "fallback_rest",
        "ai": "live_gemini" if ai_ok else "resilient_fallback",
        "engine": "FastAPI + Gemini Flash + Supabase pgvector"
    }

# Include all routers with /api prefix (for frontend)
app.include_router(auth.router, prefix="/api")
app.include_router(ideas.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(outreach.router, prefix="/api")
app.include_router(talent.router, prefix="/api")
app.include_router(mentors.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

# Also include without /api prefix for standard root route access
app.include_router(auth.router)
app.include_router(ideas.router)
app.include_router(candidates.router)
app.include_router(outreach.router)
app.include_router(talent.router)
app.include_router(mentors.router)
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
