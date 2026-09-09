import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class KnowledgeChunk(BaseModel):
    chunk_id: str
    source_id: str
    title: str
    publisher: str
    date: Optional[str] = None
    tags: List[str] = []
    url: Optional[str] = None
    section_title: str
    content: str

class KnowledgeDocument(BaseModel):
    source_id: str
    title: str
    publisher: str
    date: Optional[str] = None
    tags: List[str] = []
    url: Optional[str] = None
    file_path: str
    chunks: List[KnowledgeChunk] = []

def parse_simple_frontmatter(text: str) -> tuple[Dict[str, Any], str]:
    """Extracts frontmatter metadata between leading --- markers."""
    meta: Dict[str, Any] = {}
    body = text

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            raw_meta = parts[1].strip()
            body = parts[2].strip()
            for line in raw_meta.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    key = k.strip()
                    val = v.strip()
                    if val.startswith("[") and val.endswith("]"):
                        # Parse list
                        items = [item.strip() for item in val[1:-1].split(",") if item.strip()]
                        meta[key] = items
                    else:
                        meta[key] = val

    return meta, body

class MarkdownKnowledgeParser:
    """Parses local markdown policy/efficiency documents into structured, source-aware chunks."""

    def __init__(self, knowledge_dir: Optional[str | Path] = None):
        if knowledge_dir is None:
            knowledge_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "knowledge"
        self.knowledge_dir = Path(knowledge_dir)

    def load_documents(self) -> List[KnowledgeDocument]:
        if not self.knowledge_dir.exists():
            return []

        docs: List[KnowledgeDocument] = []
        for file_path in sorted(self.knowledge_dir.glob("*.md")):
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            meta, body = parse_simple_frontmatter(content)
            source_id = meta.get("source_id", file_path.stem)
            title = meta.get("title", file_path.stem.replace("_", " ").title())
            publisher = meta.get("publisher", "TerraOps Knowledge Base")
            date = meta.get("date")
            tags = meta.get("tags", [])
            url = meta.get("url")

            # Split body by markdown headers (## or #)
            sections = re.split(r'\n(?=#{1,3}\s+)', body)
            chunks: List[KnowledgeChunk] = []

            for idx, sec in enumerate(sections):
                cleaned_sec = sec.strip()
                if not cleaned_sec:
                    continue

                lines = cleaned_sec.splitlines()
                first_line = lines[0].strip()
                heading = re.sub(r'^#{1,3}\s+', '', first_line) if first_line.startswith("#") else f"Section {idx+1}"
                section_text = "\n".join(lines[1:]).strip() if first_line.startswith("#") else cleaned_sec

                if not section_text:
                    section_text = cleaned_sec

                chunk = KnowledgeChunk(
                    chunk_id=f"{source_id}-chunk-{idx+1}",
                    source_id=source_id,
                    title=title,
                    publisher=publisher,
                    date=date,
                    tags=tags if isinstance(tags, list) else [tags],
                    url=url,
                    section_title=heading,
                    content=f"## {heading}\n{section_text}"
                )
                chunks.append(chunk)

            doc = KnowledgeDocument(
                source_id=source_id,
                title=title,
                publisher=publisher,
                date=date,
                tags=tags if isinstance(tags, list) else [tags],
                url=url,
                file_path=str(file_path),
                chunks=chunks
            )
            docs.append(doc)

        return docs
