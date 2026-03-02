import httpx

from business.ingestion import IngestionService, IngestResult
from business.parsers import parse_html
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
        content=text.encode("utf-8"),
        filename=url,
        content_type="text/html",
    )


async def delete_document(
    document_id: str,
    ingestion_service: IngestionService,
) -> None:
    """Delete a document and its chunks from the vector store."""
    await ingestion_service.delete(document_id)
