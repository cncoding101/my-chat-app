import asyncio
from typing import Any

from typing_extensions import override

from .base import LLMProvider


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
        """
        Simulates a response from an LLM.
        """
        # Simulate some latency
        delay: float = kwargs.get("delay", 0.5)
        await asyncio.sleep(delay)

        # Determine response style from prompt or metadata
        if "error" in prompt.lower():
            raise Exception("Mock provider simulated error")

        response_text = f"Mock response to: '{prompt}'"

        if system_instruction:
            response_text = f"[System: {system_instruction}] {response_text}"

        return response_text

