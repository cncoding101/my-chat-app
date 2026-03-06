import logging

from services.embedding import EmbeddingProvider
from services.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)


class RetrieverService:
    """Retrieves relevant document chunks for a query."""

    vector_store: VectorStore
    embedding: EmbeddingProvider
    top_k: int

    def __init__(
        self,
        vector_store: VectorStore,
        embedding: EmbeddingProvider,
        top_k: int = 5,
    ):
        self.vector_store = vector_store
        self.embedding = embedding
        self.top_k = top_k

    async def search(self, query: str) -> list[str]:
        query_embedding = await self.embedding.embed(query)
        results = await self.vector_store.search(query_embedding, limit=self.top_k)

        if not results:
            logger.info(f'No results found for query: {query}')
            return []

        logger.info(f'Found {len(results)} results for query: {query}')
        for i, r in enumerate(results):
            text_preview = str(r['text'])[:150].replace('\n', ' ')
            logger.debug(
                f'Chunk {i + 1}: score={r["score"]:.4f} '
                f'doc_id={r["document_id"]} chunk_index={r["chunk_index"]} '
                f'text="{text_preview}..."'
            )
        return [str(r['text']) for r in results]

    async def search_with_scores(self, query: str) -> list[dict[str, object]]:
        query_embedding = await self.embedding.embed(query)
        return await self.vector_store.search(query_embedding, limit=self.top_k)
