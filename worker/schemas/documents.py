from pydantic import BaseModel, HttpUrl


class IngestURLRequest(BaseModel):
    """Request to ingest a document from a URL."""

    url: HttpUrl


class DocumentResponse(BaseModel):
    """Response after document ingestion."""

    document_id: str
    filename: str
    chunk_count: int
    status: str


class DocumentDeleteResponse(BaseModel):
    """Response after document deletion."""

    status: str
    document_id: str
