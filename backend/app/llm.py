import asyncio
import hashlib
import json
import random
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
try:
    import google.generativeai as genai
    _has_genai = True
except ImportError:
    genai = None
    _has_genai = False

from app.config import GEMINI_API_KEY, GEMINI_MODEL

T = TypeVar("T", bound=BaseModel)

# Prompt/Input response cache
_RESPONSE_CACHE: Dict[str, Any] = {}

# Initialize Gemini SDK if API key is provided
_gemini_configured = False
if _has_genai and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_configured = True
    except Exception as e:
        print(f"⚠️ Gemini configuration warning: {e}")

def is_ai_configured() -> bool:
    return bool(_has_genai and GEMINI_API_KEY and _gemini_configured)

def get_cache_key(prompt: str, inputs: Any = None) -> str:
    serialized = json.dumps(inputs, sort_keys=True, default=str) if inputs else ""
    raw = f"{prompt}|{serialized}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

async def call_gemini_structured(
    prompt: str,
    pydantic_cls: Type[T],
    inputs: Any = None,
    system_instruction: Optional[str] = None,
    fallback_data: Optional[Any] = None,
    max_retries: int = 3,
    timeout_seconds: float = 25.0
) -> T:
    """
    Resilient Gemini wrapper:
    - Structured JSON validated by Pydantic
    - Retries with backoff on rate limits
    - Timeouts
    - Response cache keyed by hash(prompt + inputs)
    - Fallback to cached/seeded content so the demo never breaks
    """
    cache_key = get_cache_key(prompt, inputs)
    if cache_key in _RESPONSE_CACHE:
        cached = _RESPONSE_CACHE[cache_key]
        if isinstance(cached, pydantic_cls):
            return cached
        try:
            return pydantic_cls.model_validate(cached)
        except Exception:
            pass

    # If no Gemini API key configured, immediately use fallback
    if not _gemini_configured or not GEMINI_API_KEY:
        if fallback_data is not None:
            parsed_fallback = pydantic_cls.model_validate(fallback_data)
            _RESPONSE_CACHE[cache_key] = parsed_fallback
            return parsed_fallback
        raise RuntimeError("No GEMINI_API_KEY provided and no fallback data available.")

    full_prompt = (
        f"{prompt}\n\n"
        f"INPUT DATA:\n{json.dumps(inputs, default=str) if inputs else 'None'}\n\n"
        f"IMPORTANT: Output MUST be strictly valid JSON conforming to the requested schema. "
        f"Do not include markdown codeblocks or extra text outside the JSON."
    )

    for attempt in range(1, max_retries + 1):
        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL or "gemini-2.5-flash",
                system_instruction=system_instruction or "You are an elite AI Venture Architect and Startup Evaluator for NexBridge.ai. Output strictly valid JSON."
            )

            # Run with timeout
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: model.generate_content(
                        full_prompt,
                        generation_config=genai.GenerationConfig(
                            response_mime_type="application/json",
                            temperature=0.2
                        )
                    )
                ),
                timeout=timeout_seconds
            )

            text = response.text.strip()
            # Clean possible markdown wrapping if any
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            parsed_json = json.loads(text)
            result = pydantic_cls.model_validate(parsed_json)
            _RESPONSE_CACHE[cache_key] = result
            return result

        except Exception as e:
            err_str = str(e).lower()
            is_rate_limit = "429" in err_str or "quota" in err_str or "rate limit" in err_str

            if attempt < max_retries and is_rate_limit:
                backoff = (2 ** attempt) + random.uniform(0.5, 1.5)
                print(f"⚠️ Gemini rate limit (attempt {attempt}/{max_retries}). Retrying in {backoff:.1f}s...")
                await asyncio.sleep(backoff)
            else:
                print(f"⚠️ Gemini invocation failed on attempt {attempt}: {e}")
                if attempt == max_retries:
                    break

    # If all retries fail, use verified fallback
    if fallback_data is not None:
        print("🛡️ Engaging resilient fallback content for demo continuity.")
        parsed_fallback = pydantic_cls.model_validate(fallback_data)
        _RESPONSE_CACHE[cache_key] = parsed_fallback
        return parsed_fallback

    raise RuntimeError(f"Gemini generation failed and no fallback provided.")
