import os
from pathlib import Path
from dotenv import load_dotenv

# Find root .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://btdtaxpffwjzxyiwzvzq.supabase.co").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:5%4094Pc%21zk%236@db.btdtaxpffwjzxyiwzvzq.supabase.co:5432/postgres"
)
SUPABASE_POOLER_URL = os.getenv(
    "SUPABASE_POOLER_URL",
    "postgresql://postgres.btdtaxpffwjzxyiwzvzq:5%4094Pc%21zk%236@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]
