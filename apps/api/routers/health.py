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
            
    # Check Ollama connectivity if enabled
    ollama_status = "disabled"
    if settings.OLLAMA_ENABLED:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/version")
                if resp.status_code == 200:
                    ollama_status = "reachable"
                else:
                    ollama_status = f"unreachable (status {resp.status_code})"
        except Exception:
            ollama_status = "offline / unreachable"

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
                "provider": "ollama",
                "model": settings.LLM_MODEL,
                "status": ollama_status,
                "fallback_mode": "deterministic_templates"
            }
        }
    }
