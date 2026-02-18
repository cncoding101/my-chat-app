from abc import ABC, abstractmethod
from typing import Any

from .types import LLMMessage, LLMResponse, ToolDefinition


class LLMProvider(ABC):
    """
    Abstract base class for LLM providers.

    Subclasses must implement ``generate_with_tools``.
    ``generate_response`` is provided as a convenience wrapper for simple
    text-in / text-out usage (no tools).
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        history: list[dict[str, str]] | None = None,  # noqa: ARG002  # pyright: ignore[reportUnusedParameter]
        **kwargs: Any,
    ) -> str:
        """Simple text generation without tools."""
        messages = [LLMMessage(role="user", text=prompt)]
        response = await self.generate_with_tools(
            messages, system_instruction=system_instruction, **kwargs
        )
        return response.text or ""

    @abstractmethod
    async def generate_with_tools(
        self,
        messages: list[LLMMessage],
        tools: list[ToolDefinition] | None = None,
        system_instruction: str | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        """
        Generate a response, optionally requesting function calls.

        Args:
            messages: Conversation history as provider-agnostic messages.
            tools: Tool definitions the model may invoke.
            system_instruction: System-level prompt.
            **kwargs: Provider-specific options (temperature, max_tokens …).

        Returns:
            An ``LLMResponse`` containing text and/or function calls.
        """
        ...
