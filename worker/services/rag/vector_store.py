import logging
from uuid import uuid4

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
    VectorParams,
)

from config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    """Wrapper around Qdrant for vector storage and retrieval."""

    client: AsyncQdrantClient
    collection_name: str
    vector_size: int

    def __init__(
        self,
        vector_size: int,
        client: AsyncQdrantClient,
        collection_name: str | None = None,
    ):
        self.client = client
        self.collection_name = collection_name or settings.QDRANT_COLLECTION
        self.vector_size = vector_size

    async def ensure_collection(self) -> None:
        collections = await self.client.get_collections()
        existing = [c.name for c in collections.collections]

        if self.collection_name not in existing:
            logger.info(f'Creating Qdrant collection: {self.collection_name}')
            await self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE,
                ),
            )

    async def upsert_chunks(
        self,
        document_id: str,
        chunks: list[str],
        embeddings: list[list[float]],
        metadata: dict[str, str] | None = None,
    ) -> int:
        points = [
            PointStruct(
                id=str(uuid4()),
                vector=embedding,
                payload={
                    'document_id': document_id,
                    'text': chunk,
                    'chunk_index': i,
                    **(metadata or {}),
                },
            )
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings, strict=True))
        ]

        await self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )

        logger.info(f'Stored {len(points)} chunks for document {document_id}')
        return len(points)

    async def search(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list[dict[str, object]]:
        results = await self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit,
            with_payload=True,
        )

        return [
            {
                'text': point.payload.get('text', '') if point.payload else '',
                'document_id': point.payload.get('document_id', '') if point.payload else '',
                'score': point.score,
                'chunk_index': point.payload.get('chunk_index', 0) if point.payload else 0,
            }
            for point in results.points
        ]

    async def get_chunks_by_document(self, document_id: str) -> list[dict[str, str | int]]:
        """Return all stored chunks for a document, ordered by chunk_index."""
        results = await self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key='document_id',
                        match=MatchValue(value=document_id),
                    )
                ]
            ),
            with_payload=True,
            with_vectors=False,
            limit=1000,
        )

        points = results[0]
        chunks = [
            {
                'text': point.payload.get('text', '') if point.payload else '',
                'chunk_index': point.payload.get('chunk_index', 0) if point.payload else 0,
                'document_id': document_id,
                'filename': point.payload.get('filename', '') if point.payload else '',
            }
            for point in points
        ]
        return sorted(chunks, key=lambda c: c['chunk_index'])

    async def delete_by_document(self, document_id: str) -> None:
        await self.client.delete(
            collection_name=self.collection_name,
            points_selector=FilterSelector(
                filter=Filter(
                    must=[
                        FieldCondition(
                            key='document_id',
                            match=MatchValue(value=document_id),
                        )
                    ]
                )
            ),
        )
        logger.info(f'Deleted chunks for document {document_id}')
