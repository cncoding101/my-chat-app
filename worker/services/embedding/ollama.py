import httpx
from typing_extensions import override

from config import settings

from .base import EmbeddingProvider


class OllamaProvider(EmbeddingProvider):
    """Generates text embeddings using Ollama"""

    base_url: str
    model_name: str
    client: httpx.AsyncClient
    _dimensions: int

    def __init__(self, model_name: str | None = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.base_url = settings.OLLAMA_BASE_URL or 'http://localhost:11434'
        self.client = httpx.AsyncClient()
        self._dimensions = settings.EMBEDDING_DIMENSIONS

    @property
    @override
    def dimensions(self) -> int:
        return self._dimensions

    @override
    async def embed(self, text: str) -> list[float]:
        response = await self.client.post(
            f'{self.base_url}/api/embed',
            json={'model': self.model_name, 'input': text, 'dimensions': self._dimensions},
        )
        response.raise_for_status()
        data = response.json()
        return data['embedding'][0]

    @override
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        response = await self.client.post(
            f'{self.base_url}/api/embed',
            json={'model': self.model_name, 'input': texts, 'dimensions': self._dimensions},
        )
        response.raise_for_status()
        data = response.json()
        return data['embeddings']
