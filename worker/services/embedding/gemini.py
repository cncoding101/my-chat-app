import logging

from google import genai
from google.genai.types import EmbedContentConfig
from typing_extensions import override

from config import settings

from .base import EmbeddingProvider

logger = logging.getLogger(__name__)

EMBEDDING_DIMENSIONS = 768


class GeminiProvider(EmbeddingProvider):
    """Generates text embeddings using Google's embedding model."""

    client: genai.Client
    model_name: str
    _config: EmbedContentConfig

    def __init__(self, model_name: str | None = None):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self._config = EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS)

    @property
    @override
    def dimensions(self) -> int:
        return EMBEDDING_DIMENSIONS

    @override
    async def embed(self, text: str) -> list[float]:
        result = self.client.models.embed_content(  # pyright: ignore[reportUnknownMemberType]
            model=self.model_name,
            contents=text,
            config=self._config,
        )
        if not result.embeddings:
            raise ValueError('No embeddings returned from API')
        values = result.embeddings[0].values
        if values is None:
            raise ValueError('Embedding values are None')
        return list(values)

    @override
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        result = self.client.models.embed_content(  # pyright: ignore[reportUnknownMemberType]
            model=self.model_name,
            contents=texts,
            config=self._config,
        )
        if not result.embeddings:
            raise ValueError('No embeddings returned from API')
        return [list(e.values or []) for e in result.embeddings]
