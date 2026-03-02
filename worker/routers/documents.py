from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, UploadFile

from business.ingestion import IngestionService
from controllers.document_controller import (
    delete_document as ctrl_delete_document,
)
from controllers.document_controller import (
    ingest_document as ctrl_ingest_document,
)
from controllers.document_controller import (
    ingest_url as ctrl_ingest_url,
)
from dependencies import get_http_client, get_ingestion_service
from schemas.documents import DocumentDeleteResponse, DocumentResponse, IngestURLRequest

router = APIRouter(prefix='/documents', tags=['documents'])

Ingestion = Annotated[IngestionService, Depends(get_ingestion_service)]
HttpClient = Annotated[httpx.AsyncClient, Depends(get_http_client)]


@router.post('/ingest', response_model=DocumentResponse, operation_id='ingestDocument')
async def ingest_document(
    file: UploadFile,
    ingestion_service: Ingestion,
) -> DocumentResponse:
    """Ingest a document file (PDF, text, markdown, etc.)."""
    content = await file.read()
    result = await ctrl_ingest_document(
        content=content,
        filename=file.filename or 'unknown',
        content_type=file.content_type,
        ingestion_service=ingestion_service,
    )
    return DocumentResponse(
        document_id=result.document_id,
        filename=result.filename,
        chunk_count=result.chunk_count,
        status=result.status,
    )


@router.post('/ingest-url', response_model=DocumentResponse, operation_id='ingestURL')
async def ingest_url(
    request: IngestURLRequest,
    http_client: HttpClient,
    ingestion_service: Ingestion,
) -> DocumentResponse:
    """Ingest a document from a URL."""
    result = await ctrl_ingest_url(
        url=str(request.url),
        http_client=http_client,
        ingestion_service=ingestion_service,
    )
    return DocumentResponse(
        document_id=result.document_id,
        filename=result.filename,
        chunk_count=result.chunk_count,
        status=result.status,
    )


@router.delete(
    '/{document_id}',
    response_model=DocumentDeleteResponse,
    operation_id='deleteDocument',
)
async def delete_document(
    document_id: str,
    ingestion_service: Ingestion,
) -> DocumentDeleteResponse:
    """Delete a document and its chunks from the vector store."""
    await ctrl_delete_document(
        document_id=document_id,
        ingestion_service=ingestion_service,
    )
    return DocumentDeleteResponse(status='deleted', document_id=document_id)
