import asyncio
import hashlib
import json
import random
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel
from app.config import GEMINI_API_KEY, GEMINI_MODEL

T = TypeVar("T", bound=BaseModel)

# Prompt/Input response cache (keyed by hash of prompt+inputs)
_RESPONSE_CACHE: Dict[str, Any] = {}

# Initialize google-genai client
_client = None
_gemini_configured = False

if GEMINI_API_KEY:
    try:
        from google import genai
        from google.genai import types as genai_types
        _client = genai.Client(api_key=GEMINI_API_KEY)
        _gemini_configured = True
        print(f"✅ Gemini configured with model: {GEMINI_MODEL or 'gemini-3.8-flash'}")
    except Exception as e:
        print(f"⚠️ Gemini configuration warning: {e}")

def is_ai_configured() -> bool:
    return bool(GEMINI_API_KEY and _gemini_configured and _client is not None)

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
    timeout_seconds: float = 30.0
) -> T:
    """
    Resilient Gemini wrapper using the google-genai SDK:
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

    # If no Gemini client configured, immediately use fallback
    if not _gemini_configured or _client is None:
        if fallback_data is not None:
            parsed_fallback = pydantic_cls.model_validate(fallback_data)
            _RESPONSE_CACHE[cache_key] = parsed_fallback
            return parsed_fallback
        raise RuntimeError("No GEMINI_API_KEY provided and no fallback data available.")

    model_name = GEMINI_MODEL or "gemini-3.8-flash"
    # Strip "models/" prefix if included — the new SDK uses it without prefix in some calls
    if model_name.startswith("models/"):
        model_name = model_name[len("models/"):]

    full_prompt = (
        f"{prompt}\n\n"
        f"INPUT DATA:\n{json.dumps(inputs, default=str) if inputs else 'None'}\n\n"
        f"IMPORTANT: Output MUST be strictly valid JSON conforming exactly to the requested schema. "
        f"Do NOT include markdown codeblocks, backticks, or any extra text outside the JSON object."
    )

    # Try primary model then fallback models if 404/503/429
    models_to_try = [model_name]
    for backup in ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.1-flash-lite"]:
        if backup not in models_to_try:
            models_to_try.append(backup)

    for current_model in models_to_try:
        for attempt in range(1, max_retries + 1):
            try:
                from google.genai import types as genai_types

                config = genai_types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.25,
                    system_instruction=system_instruction or (
                        "You are an elite AI Venture Architect and Startup Evaluator for NexBridge.ai. "
                        "Output strictly valid JSON with no extra text."
                    )
                )

                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda m=current_model: _client.models.generate_content(
                            model=m,
                            contents=full_prompt,
                            config=config
                        )
                    ),
                    timeout=timeout_seconds
                )

                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                elif text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()

                parsed_json = json.loads(text)
                result = pydantic_cls.model_validate(parsed_json)
                _RESPONSE_CACHE[cache_key] = result
                print(f"✅ Gemini {current_model} responded OK for {pydantic_cls.__name__}")
                return result

            except Exception as e:
                err_str = str(e).lower()
                print(f"⚠️ Gemini {current_model} attempt {attempt}/{max_retries} failed: {e}")
                if "404" in err_str or "not available" in err_str:
                    # Switch immediately to next model
                    break
                if attempt < max_retries:
                    await asyncio.sleep(1.0)
                else:
                    break

    # All retries exhausted — use verified fallback
    if fallback_data is not None:
        print("🛡️ Engaging resilient fallback content.")
        return pydantic_cls.model_validate(fallback_data)

    raise RuntimeError(f"Gemini generation failed after {max_retries} attempts and no fallback provided.")
