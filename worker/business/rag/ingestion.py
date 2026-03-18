import logging
from dataclasses import dataclass
from uuid import uuid4

from business.rag.chunker.base import ChunkerStrategy
from business.rag.summary import SummaryService
from services.embedding import EmbeddingProvider
from services.rag.vector_store import ChunkPayload, VectorStore

from .parser import parse_document

logger = logging.getLogger(__name__)


@dataclass
class IngestResult:
    document_id: str
    filename: str
    chunk_count: int
    status: str
    summary: str


class IngestionService:
    """Orchestrates the document ingestion pipeline: parse -> chunk -> embed -> store."""

    embedding: EmbeddingProvider
    summarizer: SummaryService
    chunker: ChunkerStrategy
    vector_store: VectorStore

    def __init__(
        self,
        embedding: EmbeddingProvider,
        chunker: ChunkerStrategy,
        vector_store: VectorStore,
        summarizer: SummaryService,
    ):
        self.embedding = embedding
        self.chunker = chunker
        self.vector_store = vector_store
        self.summarizer = summarizer

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

        chunk_results = await self.chunker.chunk(text)
        if not chunk_results:
            raise ValueError(f"No chunks generated from '{filename}'")

        logger.info(f"Generated {len(chunk_results)} chunks from '{filename}'")

        payloads = [
            ChunkPayload(
                text=chunk.text,
                chunk_index=i,
                document_id=document_id,
                filename=filename,
                chunk_type=chunk.chunk_type,
                parent_text=chunk.parent_text,
                parent_index=chunk.parent_index,
            )
            for i, chunk in enumerate(chunk_results)
        ]

        summary = await self.summarizer.summarize(text)
        payloads.append(
            ChunkPayload(
                text=summary,
                chunk_index=len(payloads),
                document_id=document_id,
                filename=filename,
                chunk_type='summary',
            )
        )

        embeddings = await self.embedding.embed_batch([p.text for p in payloads])

        await self.vector_store.upsert_chunks(
            chunks=payloads,
            embeddings=embeddings,
        )

        return IngestResult(
            document_id=document_id,
            filename=filename,
            chunk_count=len(payloads),
            status='completed',
            summary=summary,
        )

    async def delete(self, document_id: str) -> None:
        await self.vector_store.delete_by_document(document_id)
        logger.info(f'Deleted document {document_id}')
