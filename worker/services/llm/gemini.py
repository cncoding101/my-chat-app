from typing import Any

from google import genai
from google.genai import types
from typing_extensions import override

from config import settings

from .base import LLMProvider


class GeminiProvider(LLMProvider):
    """
    Implementation of LLMProvider for Google AI Studio using Gemini models.
    """

    api_key: str
    client: genai.Client
    model_name: str

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name or settings.LLM_MODEL

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
        try:
            response = self.client.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=kwargs.get("temperature", 0.7),
                    max_output_tokens=kwargs.get("max_tokens", settings.LLM_MAX_OUTPUT_TOKENS),
                ),
            )
            return str(response.text)
        except Exception as e:
            raise Exception(f"Gemini API Error: {e!s}") from e
