"""Tool schemas and data models for TerraOps Agent."""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class ToolSchema(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]
    read_only: bool = True


# Input models for strictly validated tool arguments
class GetMetricsArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")


class GetAnomaliesArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    method: Literal["rolling_zscore", "isolation_forest"] = Field(
        default="rolling_zscore",
        description="Anomaly detection method ('rolling_zscore' or 'isolation_forest')"
    )


class GetForecastArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    horizon_intervals: int = Field(
        default=6,
        ge=1,
        le=48,
        description="Number of time intervals to forecast forward"
    )


class SearchKnowledgeArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: str = Field(..., min_length=2, description="Search query string")
    top_k: int = Field(default=3, ge=1, le=10, description="Max citations to retrieve")


class EstimateImpactArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reduction_percent: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage reduction in consumption or runtime (0-100)"
    )
    resource_type: Optional[str] = Field(
        default=None,
        description="Optional filter for resource type (e.g. 'compute', 'storage')"
    )


class RankInterventionsArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ToolCallRecord(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Dict[str, Any]
    execution_time_ms: float
    success: bool = True
    error_message: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question or instruction")
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    tools_used: List[ToolCallRecord]
    citations: List[Dict[str, Any]]
    model_used: str
    fallback_mode: bool
    assumptions: List[str]
