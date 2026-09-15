from fastapi import APIRouter
from datetime import datetime, timezone
import httpx
import os
from apps.api.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    start_time = datetime.now(timezone.utc)
    
    # Check SQLite database accessibility
    db_dir = os.path.dirname(settings.DATABASE_PATH)
    db_status = "ready"
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
            db_status = "ready (created dir)"
        except Exception as e:
            db_status = f"error: {str(e)}"
            
    # Check AI provider connectivity
    ai_provider = "ollama"
    ai_model = settings.LLM_MODEL
    ai_status = "offline / unreachable"

    provider_pref = settings.LLM_PROVIDER.lower()
    has_nvidia_key = bool(settings.NVIDIA_API_KEY and settings.NVIDIA_API_KEY.strip())

    if provider_pref == "nvidia" or (provider_pref == "auto" and has_nvidia_key):
        ai_provider = "nvidia_nim"
        ai_model = settings.NVIDIA_MODEL
        if has_nvidia_key:
            ai_status = "configured (NVIDIA NIM API)"
        else:
            ai_status = "missing_api_key (NVIDIA_API_KEY not set)"
    elif settings.OLLAMA_ENABLED:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/version")
                if resp.status_code == 200:
                    ai_status = "reachable"
                else:
                    ai_status = f"unreachable (status {resp.status_code})"
        except Exception:
            ai_status = "offline / unreachable"

    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": start_time.isoformat(),
        "components": {
            "database": {
                "type": "sqlite",
                "path": settings.DATABASE_PATH,
                "status": db_status
            },
            "ai_inference": {
                "provider": ai_provider,
                "model": ai_model,
                "status": ai_status,
                "fallback_mode": "deterministic_templates"
            },
            "rate_limiting": {
                "enabled": settings.RATE_LIMIT_ENABLED,
                "limit_per_minute": settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
                "type": "in_memory_sliding_window"
            }
        }
    }
