import logging
import re

import numpy as np
from typing_extensions import override

from services.embedding import EmbeddingProvider

from .base import ChunkerStrategy

logger = logging.getLogger(__name__)


class SemanticChunker(ChunkerStrategy):
    """Embedding-based chunker that splits on semantic boundaries"""

    embedding_provider: EmbeddingProvider
    similarity_threshold: float
    max_chunk_tokens: int
    min_chunk_tokens: int

    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        similarity_threshold: float,
        max_chunk_tokens: int,
        min_chunk_tokens: int,
    ):
        self.embedding_provider = embedding_provider
        self.similarity_threshold = similarity_threshold
        self.max_chunk_tokens = max_chunk_tokens
        self.min_chunk_tokens = min_chunk_tokens

    @override
    def chunk_text(self, text: str) -> list[str]:
        raise NotImplementedError('Use chunk_text_async')

    @override
    async def chunk_text_async(self, text: str) -> list[str]:
        if not text or not text.strip():
            return []

        sentences = self._split_sentences(text)
        logger.debug(f'Split text into {len(sentences)} sentences')

        if len(sentences) <= 1:
            return sentences

        embeddings = await self.embedding_provider.embed_batch(sentences)
        boundaries = self._find_boundaries(embeddings)
        logger.debug(f'Found {len(boundaries)} semantic boundaries')

        chunks = self._group_sentences(sentences, boundaries)
        return chunks

    def _split_sentences(self, text: str) -> list[str]:
        raw_text = re.split(r'(?<=[.!?])\s+|\n\n+', text)
        return [s.strip() for s in raw_text]

    def _cosine_similarity(self, vector1: list[float], vector2: list[float]) -> float:
        a_arr = np.array(vector1)
        b_arr = np.array(vector2)
        return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

    def _find_boundaries(self, embeddings: list[list[float]]) -> list[int]:
        boundaries: list[int] = []
        for i in range(len(embeddings) - 1):
            sim = self._cosine_similarity(embeddings[i], embeddings[i + 1])
            logger.debug(f'Similarity between sentence {i} and {i + 1}: {sim: 4f}')
            if sim < self.similarity_threshold:
                boundaries.append(i + 1)
        return boundaries

    def _group_sentences(self, sentences: list[str], boundaries: list[int]) -> list[str]:
        if not boundaries:
            return [' '.join(sentences)]

        chunks: list[str] = []
        prev = 0

        for b in boundaries:
            chunk = ' '.join(sentences[prev:b]).strip()
            if chunk:
                chunks.append(chunk)
            prev = b

        remainder = ' '.join(sentences[prev:]).strip()
        if remainder:
            chunks.append(remainder)

        chunks = self._merge_small_chunks(chunks)
        chunks = self._enforce_max_size(chunks)

        return chunks

    def _merge_small_chunks(self, chunks: list[str]) -> list[str]:
        if not chunks:
            return chunks

        merged: list[str] = [chunks[0]]
        for chunk in chunks[1:]:
            if self.count_tokens(merged[-1]) < self.min_chunk_tokens:
                merged[-1] = merged[-1] + ' ' + chunk
            else:
                merged.append(chunk)

        if len(merged) > 1 and self.count_tokens(merged[-1]) < self.min_chunk_tokens:
            merged[-2] = merged[-2] + ' ' + merged[-1]
            merged.pop()

        return merged

    def _enforce_max_size(self, chunks: list[str]) -> list[str]:
        result: list[str] = []
        for chunk in chunks:
            if self.count_tokens(chunk) <= self.max_chunk_tokens:
                result.append(chunk)
            else:
                words = chunk.split()
                current: list[str] = []
                for word in words:
                    if len(current) >= self.max_chunk_tokens:
                        result.append(' '.join(current))
                        current = []
                    current.append(word)
                if current:
                    result.append(' '.join(current))
        return result
