import logging
from dataclasses import dataclass
from uuid import uuid4

from services.rag.chunker import chunk_text
from services.rag.embeddings import EmbeddingService
from services.rag.parsers import parse_document
from services.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)


@dataclass
class IngestResult:
    document_id: str
    filename: str
    chunk_count: int
    status: str


class IngestionService:
    """Orchestrates the document ingestion pipeline: parse -> chunk -> embed -> store."""

    embedding_service: EmbeddingService
    vector_store: VectorStore
    chunk_size: int
    chunk_overlap: int

    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_store: VectorStore,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    async def ingest(
        self,
        content: bytes,
        filename: str,
        content_type: str | None = None,
    ) -> IngestResult:
        document_id = str(uuid4())
        logger.info(f"Starting ingestion for '{filename}' (id: {document_id})")

        text = parse_document(content, filename, content_type)
        if not text.strip():
            raise ValueError(f"No text content extracted from '{filename}'")

        chunks = chunk_text(text, self.chunk_size, self.chunk_overlap)
        if not chunks:
            raise ValueError(f"No chunks generated from '{filename}'")

        logger.info(f"Generated {len(chunks)} chunks from '{filename}'")

        embeddings = await self.embedding_service.embed_texts(chunks)

        await self.vector_store.upsert_chunks(
            document_id=document_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata={"filename": filename},
        )

        return IngestResult(
            document_id=document_id,
            filename=filename,
            chunk_count=len(chunks),
            status="completed",
        )

    async def delete(self, document_id: str) -> None:
        await self.vector_store.delete_by_document(document_id)
        logger.info(f"Deleted document {document_id}")
