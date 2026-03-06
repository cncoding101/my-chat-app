from business.rag.chunker.base import ChunkerStrategy
from business.rag.chunker.fixed_chunker import FixedSizeChunker
from business.rag.chunker.semantic_chunker import SemanticChunker
from services.embedding import EmbeddingProvider


class ChunkerFactory:
    """Factory to create chunker provider instances based on the provider name"""

    @staticmethod
    def get_strategy(
        strategy: str,
        embedding_provider: EmbeddingProvider | None = None,
        chunk_size: int = 200,
        chunk_overlap: int = 50,
        similarity_threshold: float = 0.6,
        max_chunk_tokens: int = 500,
        min_chunk_tokens: int = 50,
    ) -> ChunkerStrategy:
        strategy = strategy.lower()

        if strategy == 'fixed':
            return FixedSizeChunker(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
        elif strategy == 'semantic':
            if embedding_provider is None:
                raise ValueError('SemanticChunker requires an embedding_provider')
            return SemanticChunker(
                embedding_provider=embedding_provider,
                similarity_threshold=similarity_threshold,
                max_chunk_tokens=max_chunk_tokens,
                min_chunk_tokens=min_chunk_tokens,
            )
        else:
            raise ValueError(f'Unsupported chunker strategy: {strategy}')
