import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app

@pytest.mark.asyncio
async def test_rag_search_api_known():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/rag/search?query=right-size%20compute%20resources&top_k=2")
        assert response.status_code == 200
        data = response.json()
        assert data["insufficient_evidence"] is False
        assert len(data["citations"]) >= 1
        first = data["citations"][0]
        assert "source_id" in first
        assert "title" in first
        assert "content" in first
        assert first["similarity_score"] > 0.15

@pytest.mark.asyncio
async def test_rag_search_api_unknown():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/rag/search?query=astronomy%20telescope%20galaxies&top_k=2")
        assert response.status_code == 200
        data = response.json()
        assert data["insufficient_evidence"] is True
        assert data["warning"] is not None

@pytest.mark.asyncio
async def test_rag_documents_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/rag/documents")
        assert response.status_code == 200
        docs = response.json()
        assert len(docs) >= 4
        source_ids = [d["source_id"] for d in docs]
        assert "KB-EFF-001" in source_ids
