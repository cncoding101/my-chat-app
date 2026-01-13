from typing import Optional
from .base import LLMProvider
from .gemini import GeminiProvider
from .mock import MockProvider

class LLMFactory:
    """
    Factory to create LLM provider instances based on requested provider name.
    """
    
    @staticmethod
    def get_provider(provider_name: str, model_name: Optional[str] = None) -> LLMProvider:
        """
        Returns an instance of the requested LLM provider.
        
        Args:
            provider_name: The name of the provider (e.g., "gemini", "mock").
            model_name: Optional specific model name to use.
            
        Returns:
            An instance of LLMProvider.
        """
        provider_name = provider_name.lower()
        
        if provider_name == "gemini":
            if model_name:
                return GeminiProvider(model_name=model_name)
            return GeminiProvider()
            
        if provider_name == "mock":
            return MockProvider()
            
        raise ValueError(f"Unknown LLM provider: {provider_name}")

