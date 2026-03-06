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


class ChunkDetail(BaseModel):
    """A single stored chunk."""

    chunk_index: int
    text: str
    filename: str


class DocumentChunksResponse(BaseModel):
    """Response listing all chunks for a document."""

    document_id: str
    chunk_count: int
    chunks: list[ChunkDetail]
