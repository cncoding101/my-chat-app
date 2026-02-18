import asyncio
from typing import Any

from typing_extensions import override

from .base import LLMProvider
from .types import LLMMessage, LLMResponse, ToolDefinition


class MockProvider(LLMProvider):
    """
    Mock implementation of LLMProvider for testing and experiments.
    Returns predefined or echoed responses without calling any external API.
    """

    @override
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str | None = None,
        history: list[dict[str, str]] | None = None,
        **kwargs: Any,
    ) -> str:
        delay: float = kwargs.get("delay", 0.5)
        await asyncio.sleep(delay)

        if "error" in prompt.lower():
            raise Exception("Mock provider simulated error")

        response_text = f"Mock response to: '{prompt}'"

        if system_instruction:
            response_text = f"[System: {system_instruction}] {response_text}"

        return response_text

    @override
    async def generate_with_tools(
        self,
        messages: list[LLMMessage],
        tools: list[ToolDefinition] | None = None,
        system_instruction: str | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        delay: float = kwargs.get("delay", 0.5)
        await asyncio.sleep(delay)

        last_user_msg = ""
        for msg in reversed(messages):
            if msg.role == "user" and msg.text:
                last_user_msg = msg.text
                break

        if "error" in last_user_msg.lower():
            raise Exception("Mock provider simulated error")

        response_text = f"Mock response to: '{last_user_msg}'"
        if system_instruction:
            response_text = f"[System: {system_instruction}] {response_text}"

        return LLMResponse(text=response_text)
