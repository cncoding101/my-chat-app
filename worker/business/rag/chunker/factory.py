from services.embedding import EmbeddingProvider

from .base import ChunkerStrategy
from .fixed_chunker import FixedSizeChunker
from .parent_child_chunker import ParentChildChunker
from .semantic_chunker import SemanticChunker


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
            child_strategy = FixedSizeChunker(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
            return ParentChildChunker(child_strategy=child_strategy)
        elif strategy == 'semantic':
            if embedding_provider is None:
                raise ValueError('SemanticChunker requires an embedding_provider')
            child_strategy = SemanticChunker(
                embedding_provider=embedding_provider,
                similarity_threshold=similarity_threshold,
                max_chunk_tokens=max_chunk_tokens,
                min_chunk_tokens=min_chunk_tokens,
            )
            return ParentChildChunker(child_strategy=child_strategy)
        else:
            raise ValueError(f'Unsupported chunker strategy: {strategy}')
