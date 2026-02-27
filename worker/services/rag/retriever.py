import logging

from services.embedding import EmbeddingProvider

from .vector_store import VectorStore

logger = logging.getLogger(__name__)


class Retriever:
    """Retrieves relevant document chunks for a query."""

    vector_store: VectorStore
    embedding_provider: EmbeddingProvider
    top_k: int

    def __init__(
        self,
        vector_store: VectorStore,
        embedding_provider: EmbeddingProvider,
        top_k: int = 5,
    ):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self.top_k = top_k

    async def search(self, query: str) -> list[str]:
        query_embedding = await self.embedding_provider.embed(query)
        results = await self.vector_store.search(query_embedding, limit=self.top_k)

        if not results:
            logger.info(f'No results found for query: {query}')
            return []

        logger.info(f'Found {len(results)} results for query: {query}')
        return [str(r['text']) for r in results]

    async def search_with_scores(self, query: str) -> list[dict[str, object]]:
        query_embedding = await self.embedding_provider.embed(query)
        return await self.vector_store.search(query_embedding, limit=self.top_k)
