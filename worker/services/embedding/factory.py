from .base import EmbeddingProvider
from .gemini import GeminiProvider
from .ollama import OllamaProvider


class EmbeddingFactory:
    """Factory class for creating embedding providers."""

    @staticmethod
    def get_provider(provider_name: str, model_name: str | None = None) -> EmbeddingProvider:
        """Get an embedding provider by name."""
        if provider_name == 'gemini':
            return GeminiProvider(model_name=model_name)
        elif provider_name == 'ollama':
            return OllamaProvider(model_name=model_name)
        else:
            raise ValueError(f'Unknown embedding provider: {provider_name}')
