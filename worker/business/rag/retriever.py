import logging

from qdrant_client.models import FieldCondition, Filter, MatchValue

from services.embedding import EmbeddingProvider
from services.rag.vector_store import SearchResult, VectorStore

logger = logging.getLogger(__name__)


class RetrieverService:
    """Retrieves relevant document chunks for a query."""

    vector_store: VectorStore
    embedding: EmbeddingProvider
    top_k: int
    min_score: float

    def __init__(
        self,
        vector_store: VectorStore,
        embedding: EmbeddingProvider,
        top_k: int = 5,
        min_score: float = 0.3,
    ):
        self.vector_store = vector_store
        self.embedding = embedding
        self.top_k = top_k
        self.min_score = min_score

    async def search(self, query: str) -> list[dict[str, str]]:
        query_embedding = await self.embedding.embed(query)
        results = await self.vector_store.search(
            query_embedding,
            limit=self.top_k,
            query_filter=Filter(
                must_not=[
                    FieldCondition(
                        key='chunk_type',
                        match=MatchValue(value='summary'),
                    )
                ]
            ),
            score_threshold=self.min_score,
        )

        if not results:
            logger.info(f'No results found for query: {query}')
            return []

        logger.info(f'Found {len(results)} results for query: {query} (min_score={self.min_score})')
        for i, r in enumerate(results):
            text_preview = r.text[:150].replace('\n', ' ')
            logger.debug(
                f'Chunk {i + 1}: score={r.score:.4f} '
                f'doc_id={r.document_id} chunk_index={r.chunk_index} '
                f'text="{text_preview}..."'
            )
        return self._deduplicate(results)

    async def search_with_scores(self, query: str) -> list[SearchResult]:
        query_embedding = await self.embedding.embed(query)
        return await self.vector_store.search(query_embedding, limit=self.top_k)

    def _deduplicate(self, results: list[SearchResult]) -> list[dict[str, str]]:
        """Deduplicate by parent — keep only the highest-scoring child per parent chunk."""
        seen: set[tuple[str, int]] = set()
        deduplicated: list[dict[str, str]] = []

        for result in results:
            if result.parent_index is None:
                continue

            key = (result.document_id, result.parent_index)

            if key in seen:
                continue
            seen.add(key)

            text = result.parent_text or result.text
            deduplicated.append(
                {
                    'text': text,
                    'filename': result.filename,
                }
            )

        return deduplicated

    async def search_summaries(self, query: str) -> list[dict[str, str]]:
        query_embedding = await self.embedding.embed(query)
        results = await self.vector_store.search(
            query_embedding,
            limit=self.top_k,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key='chunk_type',
                        match=MatchValue(value='summary'),
                    )
                ]
            ),
            score_threshold=self.min_score,
        )

        logger.info(
            f'Found {len(results)} summaries for query: {query} '
            f'(min_score={self.min_score})'
        )

        return [{'text': result.text, 'filename': result.filename} for result in results]
