from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, UploadFile

from dependencies import get_http_client, get_ingestion_service
from schemas.documents import DocumentDeleteResponse, DocumentResponse, IngestURLRequest
from services.rag.ingestion import IngestionService, IngestResult
from services.rag.parsers import fetch_and_parse_url

router = APIRouter(prefix="/documents", tags=["documents"])

Ingestion = Annotated[IngestionService, Depends(get_ingestion_service)]
HttpClient = Annotated[httpx.AsyncClient, Depends(get_http_client)]


def _to_response(result: IngestResult) -> DocumentResponse:
    return DocumentResponse(
        document_id=result.document_id,
        filename=result.filename,
        chunk_count=result.chunk_count,
        status=result.status,
    )


@router.post("/ingest", response_model=DocumentResponse, operation_id="ingestDocument")
async def ingest_document(
    file: UploadFile,
    ingestion_service: Ingestion,
) -> DocumentResponse:
    """Ingest a document file (PDF, text, markdown, etc.)."""
    content = await file.read()
    result = await ingestion_service.ingest(
        content=content,
        filename=file.filename or "unknown",
        content_type=file.content_type,
    )
    return _to_response(result)


@router.post("/ingest-url", response_model=DocumentResponse, operation_id="ingestURL")
async def ingest_url(
    request: IngestURLRequest,
    http_client: HttpClient,
    ingestion_service: Ingestion,
) -> DocumentResponse:
    """Ingest a document from a URL."""
    text = await fetch_and_parse_url(str(request.url), http_client)
    result = await ingestion_service.ingest(
        content=text.encode("utf-8"),
        filename=str(request.url),
        content_type="text/html",
    )
    return _to_response(result)


@router.delete(
    "/{document_id}",
    response_model=DocumentDeleteResponse,
    operation_id="deleteDocument",
)
async def delete_document(
    document_id: str,
    ingestion_service: Ingestion,
) -> DocumentDeleteResponse:
    """Delete a document and its chunks from the vector store."""
    await ingestion_service.delete(document_id)
    return DocumentDeleteResponse(status="deleted", document_id=document_id)
