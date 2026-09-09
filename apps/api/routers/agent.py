"""API Router for TerraOps Agent and Conversational Assistant."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from packages.domain.agent.assistant import get_assistant
from packages.domain.agent.schemas import ChatRequest, ChatResponse, ToolCallRecord, ToolSchema
from packages.domain.agent.tools import ToolExecutionError, get_tool_registry

router = APIRouter(prefix="/api/agent", tags=["agent"])


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
async def chat_with_assistant(request: ChatRequest):
    """Interact with TerraOps conversational assistant.

    Automatically dispatches safe read-only tools, retrieves citations,
    and synthesizes an evidence-grounded response.
    """
    assistant = get_assistant()
    response = await assistant.answer(request)
    return response


@router.get("/provider/health")
async def check_provider_health():
    """Check availability of the local LLM inference provider (Ollama)."""
    assistant = get_assistant()
    health = await assistant.provider.health_check()
    return health.model_dump()
