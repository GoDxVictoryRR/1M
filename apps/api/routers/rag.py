from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any

from packages.domain.rag.retriever import LocalKnowledgeRetriever, RetrievalResponse

router = APIRouter(prefix="/api/rag", tags=["rag"])

retriever = LocalKnowledgeRetriever()

@router.get("/search", response_model=RetrievalResponse)
async def search_knowledge(
    query: str = Query(..., min_length=2, description="Search query regarding sustainability policies or guidelines"),
    top_k: int = Query(3, ge=1, le=10)
):
    """
    Retrieves evidence-grounded source citations from the local knowledge base.
    Includes similarity scoring and low-confidence warnings when evidence is insufficient.
    """
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty or whitespace only")

    return retriever.retrieve(query=query, top_k=top_k)

@router.get("/documents")
async def list_documents():
    """Lists indexed knowledge documents and metadata."""
    return retriever.list_documents()
