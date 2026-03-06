import httpx

from business.rag.ingestion import IngestionService, IngestResult
from business.rag.parser import parse_html
from services.rag.vector_store import VectorStore
from services.web_fetcher import fetch_url


async def ingest_document(
    content: bytes,
    filename: str,
    content_type: str | None,
    ingestion_service: IngestionService,
) -> IngestResult:
    """Ingest a document file (PDF, text, markdown, etc.)."""
    return await ingestion_service.ingest(
        content=content,
        filename=filename,
        content_type=content_type,
    )


async def ingest_url(
    url: str,
    http_client: httpx.AsyncClient,
    ingestion_service: IngestionService,
) -> IngestResult:
    """Ingest a document from a URL."""
    html = await fetch_url(url, http_client)
    text = parse_html(html)
    return await ingestion_service.ingest(
        content=text.encode('utf-8'),
        filename=url,
        content_type='text/html',
    )


async def delete_document(
    document_id: str,
    ingestion_service: IngestionService,
) -> None:
    """Delete a document and its chunks from the vector store."""
    await ingestion_service.delete(document_id)


async def get_document_chunks(
    document_id: str,
    vector_store: VectorStore,
) -> list[dict[str, str | int]]:
    """Retrieve all stored chunks for a document from the vector store."""
    return await vector_store.get_chunks_by_document(document_id)
