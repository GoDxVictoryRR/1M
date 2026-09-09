from typing import List, Optional, Dict, Any
from pathlib import Path
from pydantic import BaseModel, Field
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.metrics.pairwise import cosine_similarity

from packages.domain.rag.chunker import MarkdownKnowledgeParser, KnowledgeChunk, KnowledgeDocument

class ScoredCitation(BaseModel):
    chunk_id: str
    source_id: str
    title: str
    publisher: str
    date: Optional[str] = None
    tags: List[str] = []
    url: Optional[str] = None
    section_title: str
    content: str
    similarity_score: float = Field(ge=0.0, le=1.0)

class RetrievalResponse(BaseModel):
    query: str
    top_k: int
    threshold: float
    insufficient_evidence: bool
    citations: List[ScoredCitation]
    warning: Optional[str] = None

class LocalKnowledgeRetriever:
    """Local, offline, zero-cost semantic search and evidence retrieval engine."""

    def __init__(self, knowledge_dir: Optional[str | Path] = None, min_similarity_threshold: float = 0.20):
        self.parser = MarkdownKnowledgeParser(knowledge_dir)
        self.threshold = min_similarity_threshold
        self.chunks: List[KnowledgeChunk] = []
        self.documents: List[KnowledgeDocument] = []
        self.vectorizer = TfidfVectorizer(
            token_pattern=r"(?u)\b[a-zA-Z0-9_-]{2,}\b",
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.chunk_matrix = None
        self._build_index()

    def _build_index(self):
        self.documents = self.parser.load_documents()
        self.chunks = []
        for doc in self.documents:
            self.chunks.extend(doc.chunks)

        if not self.chunks:
            return

        corpus = [
            f"{c.title} {' '.join(c.tags)} {c.section_title} {c.content}"
            for c in self.chunks
        ]
        self.chunk_matrix = self.vectorizer.fit_transform(corpus)

    def retrieve(self, query: str, top_k: int = 3) -> RetrievalResponse:
        cleaned_query = query.strip()
        if not cleaned_query or not self.chunks or self.chunk_matrix is None:
            return RetrievalResponse(
                query=query,
                top_k=top_k,
                threshold=self.threshold,
                insufficient_evidence=True,
                citations=[],
                warning="No knowledge base documents indexed or query is empty."
            )

        query_vector = self.vectorizer.transform([cleaned_query])
        similarities = cosine_similarity(query_vector, self.chunk_matrix)[0]

        # Extract non-stop query tokens
        stop_words = self.vectorizer.get_stop_words() or set()
        q_lower = cleaned_query.lower()
        q_tokens = [w for w in re.findall(r'[a-zA-Z0-9_-]+', q_lower) if len(w) > 2 and w not in stop_words]

        for idx, chunk in enumerate(self.chunks):
            boost = 0.0
            # Tag match bonus
            for tag in chunk.tags:
                tag_lower = tag.lower()
                if tag_lower in q_lower or any(t in q_tokens for t in tag_lower.split("-")):
                    boost += 0.15
            # Key title terms bonus
            title_terms = [w for w in re.findall(r'[a-zA-Z0-9_-]+', chunk.title.lower()) if len(w) > 3 and w not in ["best", "practices"]]
            matched_title_terms = [w for w in title_terms if w in q_tokens]
            if matched_title_terms:
                boost += min(0.20, 0.10 * len(matched_title_terms))

            # Only boost if there is genuine keyword relevance
            if similarities[idx] > 0.02 or boost >= 0.15:
                similarities[idx] = min(1.0, similarities[idx] + boost)

        # Get indices sorted by similarity descending
        ranked_indices = np.argsort(similarities)[::-1]

        citations: List[ScoredCitation] = []
        for idx in ranked_indices[:top_k]:
            sim = float(similarities[idx])
            chunk = self.chunks[idx]
            citations.append(ScoredCitation(
                chunk_id=chunk.chunk_id,
                source_id=chunk.source_id,
                title=chunk.title,
                publisher=chunk.publisher,
                date=chunk.date,
                tags=chunk.tags,
                url=chunk.url,
                section_title=chunk.section_title,
                content=chunk.content,
                similarity_score=round(max(0.0, min(1.0, sim)), 3)
            ))

        # Check query term coverage against top chunk
        top_chunk = self.chunks[ranked_indices[0]] if len(ranked_indices) > 0 else None
        coverage_ratio = 0.0
        if top_chunk:
            q_stems = [w.rstrip('sed').rstrip('ing') for w in re.findall(r'[a-zA-Z0-9]+', q_lower) if len(w) > 2 and w not in stop_words]
            if q_stems:
                chunk_stems = set(w.rstrip('sed').rstrip('ing') for w in re.findall(r'[a-zA-Z0-9]+', (top_chunk.title + " " + " ".join(top_chunk.tags) + " " + top_chunk.content).lower()))
                term_overlap_count = sum(1 for qs in q_stems if qs in chunk_stems or any(qs in cs for cs in chunk_stems))
                coverage_ratio = term_overlap_count / len(q_stems)

        max_sim = citations[0].similarity_score if citations else 0.0

        # Insufficient evidence if similarity is below threshold OR query term coverage is low (< 35%)
        insufficient = (max_sim < self.threshold) or (coverage_ratio < 0.35)

        warning = None
        if insufficient:
            warning = (
                f"Low confidence (similarity {max_sim:.2f}, query term coverage {coverage_ratio*100:.0f}%). "
                f"Evidence in the local knowledge base is insufficient to answer this query authoritatively."
            )


        return RetrievalResponse(
            query=query,
            top_k=top_k,
            threshold=self.threshold,
            insufficient_evidence=insufficient,
            citations=citations if not insufficient else citations[:1],
            warning=warning
        )

    def list_documents(self) -> List[Dict[str, Any]]:
        return [
            {
                "source_id": doc.source_id,
                "title": doc.title,
                "publisher": doc.publisher,
                "date": doc.date,
                "tags": doc.tags,
                "chunk_count": len(doc.chunks)
            }
            for doc in self.documents
        ]
