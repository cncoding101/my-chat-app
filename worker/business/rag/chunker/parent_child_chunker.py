from typing_extensions import override

from .base import ChunkerStrategy, ChunkResult
from .fixed_chunker import FixedSizeChunker


class ParentChildChunker(ChunkerStrategy):
    child_strategy: ChunkerStrategy
    _parent_chunker: FixedSizeChunker

    def __init__(
        self, child_strategy: ChunkerStrategy, chunk_size: int = 800, chunk_overlap: int = 100
    ):
        self.child_strategy = child_strategy
        self._parent_chunker = FixedSizeChunker(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    @override
    async def chunk(self, text: str) -> list[ChunkResult]:
        if not text or not text.strip():
            return []

        parent_chunks = await self._parent_chunker.chunk(text)
        children_per_parent = [
            await self.child_strategy.chunk(parent.text) for parent in parent_chunks
        ]

        return self._build_results(parent_chunks, children_per_parent)

    def _build_results(
        self, parent_chunks: list[ChunkResult], children_per_parent: list[list[ChunkResult]]
    ) -> list[ChunkResult]:
        results: list[ChunkResult] = []
        for parent_index, (parent, children) in enumerate(
            zip(parent_chunks, children_per_parent, strict=True)
        ):
            for child in children:
                results.append(
                    ChunkResult(
                        text=child.text,
                        parent_text=parent.text,
                        parent_index=parent_index,
                        chunk_type='child',
                    )
                )

        return results
