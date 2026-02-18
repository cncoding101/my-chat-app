import json
import logging
from typing import Any

from ollama import AsyncClient
from typing_extensions import override

from config import settings

from .base import LLMProvider
from .types import FunctionCall, LLMMessage, LLMResponse, ToolDefinition

logger = logging.getLogger(__name__)


class OllamaProvider(LLMProvider):
    """LLM provider for locally-hosted models via Ollama."""

    client: AsyncClient
    model_name: str

    def __init__(self, base_url: str | None = None, model_name: str | None = None):
        self.client = AsyncClient(host=base_url or settings.OLLAMA_BASE_URL)
        self.model_name = model_name or settings.LLM_MODEL

    @override
    async def generate_with_tools(
        self,
        messages: list[LLMMessage],
        tools: list[ToolDefinition] | None = None,
        system_instruction: str | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        ollama_messages = self._to_ollama_messages(messages, system_instruction)
        ollama_tools = self._to_ollama_tools(tools) if tools else None

        try:
            response = await self.client.chat(  # pyright: ignore[reportUnknownMemberType]
                model=self.model_name,
                messages=ollama_messages,
                tools=ollama_tools,
                options={
                    "temperature": kwargs.get("temperature", 0.7),
                    "num_predict": kwargs.get("max_tokens", settings.LLM_MAX_OUTPUT_TOKENS),
                },
            )
        except Exception as e:
            raise Exception(
                f"Ollama error: {e!s}. Is Ollama running at {settings.OLLAMA_BASE_URL}?"
            ) from e

        message = response.message
        function_calls: list[FunctionCall] = []

        if message.tool_calls:
            for tc in message.tool_calls:
                function_calls.append(
                    FunctionCall(
                        name=tc.function.name,
                        args=dict(tc.function.arguments) if tc.function.arguments else {},
                    )
                )

        text = message.content if not function_calls else None
        return LLMResponse(text=text, function_calls=function_calls)

    # -- Internal conversions --------------------------------------------------

    def _to_ollama_messages(
        self, messages: list[LLMMessage], system_instruction: str | None = None
    ) -> list[dict[str, Any]]:
        """Convert abstract messages → Ollama message dicts."""
        result: list[dict[str, Any]] = []

        if system_instruction:
            result.append({"role": "system", "content": system_instruction})

        for msg in messages:
            if msg.role == "user":
                result.append({"role": "user", "content": msg.text or ""})
            elif msg.role == "assistant":
                entry: dict[str, Any] = {"role": "assistant", "content": msg.text or ""}
                if msg.function_calls:
                    entry["tool_calls"] = [
                        {
                            "type": "function",
                            "function": {
                                "name": fc.name,
                                "arguments": fc.args,
                            },
                        }
                        for fc in msg.function_calls
                    ]
                result.append(entry)
            elif msg.role == "tool":
                for fr in msg.function_results:
                    result.append({"role": "tool", "content": json.dumps(fr.response)})

        return result

    def _to_ollama_tools(self, tools: list[ToolDefinition]) -> list[dict[str, Any]]:
        """Convert abstract tool definitions → Ollama/OpenAI-style tool dicts."""
        result: list[dict[str, Any]] = []
        for tool in tools:
            properties: dict[str, Any] = {}
            required: list[str] = []

            if tool.parameters:
                for name, info in tool.parameters.items():
                    properties[name] = {
                        "type": info.get("type", "string").lower(),
                        "description": info.get("description", ""),
                    }
                    required.append(name)

            result.append(
                {
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": {
                            "type": "object",
                            "properties": properties,
                            "required": required,
                        },
                    },
                }
            )
        return result
