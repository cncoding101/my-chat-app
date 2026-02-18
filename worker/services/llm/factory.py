from .base import LLMProvider
from .gemini import GeminiProvider
from .mock import MockProvider
from .ollama import OllamaProvider


class LLMFactory:
    """Factory to create LLM provider instances based on provider name."""

    @staticmethod
    def get_provider(provider_name: str, model_name: str | None = None) -> LLMProvider:
        provider_name = provider_name.lower()

        if provider_name == "gemini":
            return GeminiProvider(model_name=model_name) if model_name else GeminiProvider()

        if provider_name == "ollama":
            return OllamaProvider(model_name=model_name) if model_name else OllamaProvider()

        if provider_name == "mock":
            return MockProvider()

        raise ValueError(
            f"Unknown LLM provider: '{provider_name}'. Supported providers: gemini, ollama, mock"
        )
