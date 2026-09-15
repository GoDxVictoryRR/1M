"""API Router for TerraOps Agent and Conversational Assistant."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel

from packages.domain.agent.assistant import get_assistant
from packages.domain.agent.rate_limiter import get_rate_limiter
from packages.domain.agent.schemas import ChatRequest, ChatResponse, ToolCallRecord, ToolSchema
from packages.domain.agent.tools import ToolExecutionError, get_tool_registry

router = APIRouter(prefix="/api/agent", tags=["agent"])


def _get_client_ip(request: Request) -> str:
    """Extract client IP from proxy headers or direct connection."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


class DirectToolInvocation(BaseModel):
    arguments: Optional[Dict[str, Any]] = None


@router.get("/tools", response_model=List[ToolSchema])
async def list_available_tools():
    """List all safe, allowlisted, read-only tools available to the assistant."""
    registry = get_tool_registry()
    return registry.list_tools()


@router.post("/tool/{tool_name}", response_model=ToolCallRecord)
async def execute_tool_directly(tool_name: str, payload: Optional[DirectToolInvocation] = None):
    """Directly invoke an allowlisted tool with strict input schema validation."""
    registry = get_tool_registry()
    args = payload.arguments if payload and payload.arguments else {}

    try:
        record = registry.execute(tool_name=tool_name, arguments=args)
        return record
    except ToolExecutionError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(chat_req: ChatRequest, request: Request, response: Response):
    """Interact with TerraOps conversational assistant.

    Automatically dispatches safe read-only tools, retrieves citations,
    and synthesizes an evidence-grounded response with rate limit protection.
    """
    # Rate limit check per client IP
    limiter = get_rate_limiter()
    client_ip = _get_client_ip(request)
    allowed, remaining, retry_after = limiter.check(client_ip)

    if not allowed:
        headers = {
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(limiter.max_requests),
            "X-RateLimit-Remaining": "0",
        }
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limiter.max_requests} requests per minute allowed. Please wait {retry_after} second(s) before retrying.",
            headers=headers,
        )

    response.headers["X-RateLimit-Limit"] = str(limiter.max_requests)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    assistant = get_assistant()
    chat_resp = await assistant.answer(chat_req)
    return chat_resp


@router.get("/provider/health")
async def check_provider_health():
    """Check availability of the active LLM inference provider (Ollama, NVIDIA NIM, or Fallback)."""
    assistant = get_assistant()
    health = await assistant.provider.health_check()
    return health.model_dump()
