import json
import ssl
from typing import Any, Dict, List, Optional
import asyncpg
import httpx
from app.config import (
    DATABASE_URL,
    SUPABASE_POOLER_URL,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY
)

_pool: Optional[asyncpg.Pool] = None

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

async def init_db_pool():
    global _pool
    if _pool is not None:
        return _pool

    ssl_ctx = get_ssl_context()
    # Try pooler URL first for reliable IPv4 resolution
    candidate_urls = [
        SUPABASE_POOLER_URL.split("?")[0],
        DATABASE_URL.split("?")[0]
    ]

    last_err = None
    for url in candidate_urls:
        try:
            _pool = await asyncpg.create_pool(
                url,
                ssl=ssl_ctx,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            # test query
            async with _pool.acquire() as conn:
                await conn.fetchval("SELECT 1;")
            return _pool
        except Exception as e:
            last_err = e
            continue

    print(f"⚠️ Warning: Could not establish asyncpg pool ({last_err}), using REST fallback.")
    return None

async def close_db_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

async def check_db_health() -> bool:
    global _pool
    if _pool is None:
        return False
    try:
        async with _pool.acquire() as conn:
            val = await conn.fetchval("SELECT 1;")
            return val == 1
    except Exception:
        return False

async def fetch_all(query: str, *args) -> List[Dict[str, Any]]:
    global _pool
    if _pool is None:
        await init_db_pool()
    if _pool:
        async with _pool.acquire() as conn:
            records = await conn.fetch(query, *args)
            return [dict(r) for r in records]
    return []

async def fetch_one(query: str, *args) -> Optional[Dict[str, Any]]:
    global _pool
    if _pool is None:
        await init_db_pool()
    if _pool:
        async with _pool.acquire() as conn:
            record = await conn.fetchrow(query, *args)
            return dict(record) if record else None
    return None

async def execute(query: str, *args) -> str:
    global _pool
    if _pool is None:
        await init_db_pool()
    if _pool:
        async with _pool.acquire() as conn:
            return await conn.execute(query, *args)
    return ""

# Supabase REST & Storage Client helper
def get_supabase_headers() -> Dict[str, str]:
    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }

async def upload_resume_file(file_bytes: bytes, filename: str, content_type: str = "application/pdf") -> str:
    """Uploads file to Supabase private storage bucket 'resumes' and returns path"""
    url = f"{SUPABASE_URL}/storage/v1/object/resumes/{filename}"
    headers = get_supabase_headers()
    headers["Content-Type"] = content_type
    headers["x-upsert"] = "true"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, content=file_bytes, headers=headers)
        if res.status_code in (200, 201):
            return f"resumes/{filename}"
        else:
            print(f"Storage upload response ({res.status_code}): {res.text}")
            return f"resumes/{filename}"
