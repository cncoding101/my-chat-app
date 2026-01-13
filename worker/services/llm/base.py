from abc import ABC, abstractmethod
from typing import Optional

class LLMProvider(ABC):
    """
    Abstract base class for LLM providers.
    All specific provider implementations (Gemini, OpenAI, etc.) must inherit from this.
    """

    @abstractmethod
    async def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        history: Optional[list] = None,
        **kwargs
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

