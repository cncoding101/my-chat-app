from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    """Abstract class for embedding providers."""

    @property
    @abstractmethod
    def dimensions(self) -> int:
        """The output dimensionality of the embedding model."""

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Embed a single text string"""

    @abstractmethod
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of text strings"""
