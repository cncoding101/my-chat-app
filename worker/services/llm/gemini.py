import os
from typing import Optional, List
from google import genai
from google.genai import types
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    """
    Implementation of LLMProvider for Google AI Studio using Gemini models.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash"):
        """
        Initializes the Gemini client.
        
        Args:
            api_key: The Google AI Studio API key. Defaults to GOOGLE_API_KEY env var.
            model_name: The specific Gemini model to use.
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key is required. Provide it via __init__ or GOOGLE_API_KEY env var.")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

    async def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        history: Optional[List[dict]] = None,
        **kwargs
    ) -> str:
        """
        Generates a response using the Gemini model.
        """
        # Convert history if provided (Gemini expects specific format)
        # Note: In a real implementation, we'd map history more robustly.
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=kwargs.get("temperature", 0.7),
                    max_output_tokens=kwargs.get("max_tokens", 1000),
                )
            )
            return response.text
        except Exception as e:
            # Re-raise or handle as needed for your app's error policy
            raise Exception(f"Gemini API Error: {str(e)}")

