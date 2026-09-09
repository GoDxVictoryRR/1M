import pytest
from packages.domain.rag.chunker import MarkdownKnowledgeParser
from packages.domain.rag.retriever import LocalKnowledgeRetriever

def test_markdown_parser_loads_knowledge_chunks():
    parser = MarkdownKnowledgeParser()
    docs = parser.load_documents()
    assert len(docs) >= 4

    source_ids = [d.source_id for d in docs]
    assert "KB-EFF-001" in source_ids
    assert "KB-SCH-002" in source_ids
    assert "KB-GHG-003" in source_ids
    assert "KB-PUE-004" in source_ids

    # Verify chunk properties
    for doc in docs:
        assert len(doc.chunks) >= 1
        for chunk in doc.chunks:
            assert chunk.source_id == doc.source_id
            assert chunk.title == doc.title
            assert chunk.publisher
            assert len(chunk.content) > 20

def test_rag_retrieval_known_queries():
    retriever = LocalKnowledgeRetriever(min_similarity_threshold=0.20)

    # 1. Query matching right-sizing
    res1 = retriever.retrieve("How do we right-size underutilized compute instances?", top_k=2)
    assert res1.insufficient_evidence is False
    assert len(res1.citations) >= 1
    top_citation = res1.citations[0]
    assert top_citation.source_id == "KB-EFF-001"
    assert "right-sizing" in top_citation.title.lower() or "right-sizing" in [t.lower() for t in top_citation.tags]

    # 2. Query matching Scope 2 guidance
    res2 = retriever.retrieve("What is the location-based Scope 2 accounting formula?", top_k=2)
    assert res2.insufficient_evidence is False
    assert res2.citations[0].source_id == "KB-GHG-003"
    assert "ghg" in res2.citations[0].source_id.lower() or "scope" in res2.citations[0].title.lower()

def test_rag_retrieval_insufficient_evidence_unknown_query():
    retriever = LocalKnowledgeRetriever(min_similarity_threshold=0.20)



    # Query with no overlap in sustainability knowledge base
    res = retriever.retrieve("What is the best recipe for chocolate chip cookies?", top_k=3)
    assert res.insufficient_evidence is True
    assert res.warning is not None
    assert "insufficient" in res.warning.lower() or "low confidence" in res.warning.lower()

def test_rag_offline_execution():
    # Verify retriever requires zero network dependencies
    retriever = LocalKnowledgeRetriever()
    docs = retriever.list_documents()
    assert len(docs) >= 4
