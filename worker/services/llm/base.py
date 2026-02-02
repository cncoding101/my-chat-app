from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    """
    Abstract base class for LLM providers.
    All specific provider implementations (Gemini, OpenAI, etc.) must inherit from this.
    """

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        history: list[dict[str, str]] | None = None,
        **kwargs: Any,
    ) -> str:
        """
        Generates a response from the LLM.

        Args:
            prompt: The user's input message.
            system_instruction: Optional system-level prompt/persona.
            history: Optional list of previous messages for context.
            **kwargs: Additional model-specific parameters (temperature, top_p, etc.)

        Returns:
            The generated text response.
        """
        pass

