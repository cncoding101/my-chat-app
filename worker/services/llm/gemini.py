from typing import Any

from google import genai  # pyright: ignore[reportAttributeAccessIssue]
from google.genai import types  # pyright: ignore[reportMissingImports]
from typing_extensions import override

from config import settings

from .base import LLMProvider


class GeminiProvider(LLMProvider):
    """
    Implementation of LLMProvider for Google AI Studio using Gemini models.
    """

    api_key: str
    client: genai.Client  # pyright: ignore[reportUnknownMemberType]
    model_name: str

    def __init__(self, api_key: str | None = None, model_name: str = "gemini-2.0-flash"):
        """
        Initializes the Gemini client.

        Args:
            api_key: The Google AI Studio API key. Defaults to settings.GOOGLE_API_KEY.
            model_name: The specific Gemini model to use.
        """
        self.api_key = api_key or settings.GOOGLE_API_KEY
        self.client = genai.Client(api_key=self.api_key)  # pyright: ignore[reportUnknownMemberType]
        self.model_name = model_name

    @override
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        history: list[dict[str, str]] | None = None,
        **kwargs: Any,
    ) -> str:
        """
        Generates a response using the Gemini model.
        """
        # Convert history if provided (Gemini expects specific format)
        # Note: In a real implementation, we'd map history more robustly.

        try:
            response = self.client.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(  # pyright: ignore[reportUnknownMemberType]
                    system_instruction=system_instruction,
                    temperature=kwargs.get("temperature", 0.7),
                    max_output_tokens=kwargs.get("max_tokens", 1000),
                ),
            )
            return str(response.text)  # pyright: ignore[reportUnknownMemberType, reportUnknownArgumentType]
        except Exception as e:
            # Re-raise or handle as needed for your app's error policy
            raise Exception(f"Gemini API Error: {e!s}") from e
