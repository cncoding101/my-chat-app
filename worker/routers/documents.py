from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, UploadFile

from business.rag.ingestion import IngestionService
from controllers.document_controller import (
    delete_document as ctrl_delete_document,
)
from controllers.document_controller import (
    get_document_chunks as ctrl_get_document_chunks,
)
from controllers.document_controller import (
    ingest_document as ctrl_ingest_document,
)
from controllers.document_controller import (
    ingest_url as ctrl_ingest_url,
)
from dependencies import get_http_client, get_ingestion_service, get_vector_store
from schemas.documents import (
    ChunkDetail,
    DocumentChunksResponse,
    DocumentDeleteResponse,
    DocumentResponse,
    IngestURLRequest,
)
from services.rag.vector_store import VectorStore

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


@router.get(
    '/{document_id}/chunks',
    response_model=DocumentChunksResponse,
    operation_id='getDocumentChunks',
)
async def get_document_chunks(
    document_id: str,
    vector_store: Annotated[VectorStore, Depends(get_vector_store)],
) -> DocumentChunksResponse:
    """Inspect all stored chunks for a document. Useful for debugging RAG issues."""
    chunks = await ctrl_get_document_chunks(
        document_id=document_id,
        vector_store=vector_store,
    )
    return DocumentChunksResponse(
        document_id=document_id,
        chunk_count=len(chunks),
        chunks=[
            ChunkDetail(
                chunk_index=int(c['chunk_index']),
                text=str(c['text']),
                filename=str(c['filename']),
            )
            for c in chunks
        ],
    )
