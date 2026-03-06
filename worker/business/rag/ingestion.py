import logging
from dataclasses import dataclass
from uuid import uuid4

from business.rag.chunker.base import ChunkerStrategy
from business.rag.chunker.semantic_chunker import SemanticChunker
from services.embedding import EmbeddingProvider
from services.rag.vector_store import VectorStore

from .parser import parse_document

logger = logging.getLogger(__name__)


@dataclass
class IngestResult:
    document_id: str
    filename: str
    chunk_count: int
    status: str


class IngestionService:
    """Orchestrates the document ingestion pipeline: parse -> chunk -> embed -> store."""

    embedding: EmbeddingProvider
    chunker: ChunkerStrategy
    vector_store: VectorStore

    def __init__(
        self,
        embedding: EmbeddingProvider,
        chunker: ChunkerStrategy,
        vector_store: VectorStore,
    ):
        self.embedding = embedding
        self.chunker = chunker
        self.vector_store = vector_store

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

        chunks = []
        if isinstance(self.chunker, SemanticChunker):
            chunks = await self.chunker.chunk_text_async(text)
        else:
            chunks = self.chunker.chunk_text(text)
        if not chunks:
            raise ValueError(f"No chunks generated from '{filename}'")

        logger.info(f"Generated {len(chunks)} chunks from '{filename}'")

        embeddings = await self.embedding.embed_batch(chunks)

        await self.vector_store.upsert_chunks(
            document_id=document_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata={'filename': filename},
        )

        return IngestResult(
            document_id=document_id,
            filename=filename,
            chunk_count=len(chunks),
            status='completed',
        )

    async def delete(self, document_id: str) -> None:
        await self.vector_store.delete_by_document(document_id)
        logger.info(f'Deleted document {document_id}')
