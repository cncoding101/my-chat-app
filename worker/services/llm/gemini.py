import logging
from typing import Any

from google import genai
from google.genai import types
from typing_extensions import override

from config import settings

from .base import LLMProvider
from .types import FunctionCall, LLMMessage, LLMResponse, ToolDefinition

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProvider):
    """LLM provider for Google Gemini via Google AI Studio."""

    client: genai.Client
    model_name: str

    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        api_key = api_key or settings.GOOGLE_API_KEY
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY is required for GeminiProvider. Get one at https://aistudio.google.com/apikey"
            )
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name or settings.LLM_MODEL

    @override
    async def generate_with_tools(
        self,
        messages: list[LLMMessage],
        tools: list[ToolDefinition] | None = None,
        system_instruction: str | None = None,
        **kwargs: Any,
    ) -> LLMResponse:
        contents = self._to_contents(messages)
        gemini_tools = self._to_gemini_tools(tools) if tools else None

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=gemini_tools,
            temperature=kwargs.get("temperature", 0.7),
            max_output_tokens=kwargs.get("max_tokens", settings.LLM_MAX_OUTPUT_TOKENS),
        )

        try:
            response = self.client.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
                model=self.model_name,
                contents=contents,
                config=config,
            )
        except Exception as e:
            raise Exception(f"Gemini API error: {e!s}") from e

        if not response.candidates:
            return LLMResponse()

        content = response.candidates[0].content
        if content is None:
            return LLMResponse()

        function_calls = [
            FunctionCall(
                name=str(part.function_call.name),
                args=dict(part.function_call.args) if part.function_call.args else {},
            )
            for part in (content.parts or [])
            if part.function_call is not None
        ]

        text = str(response.text) if not function_calls and response.text else None
        return LLMResponse(text=text, function_calls=function_calls)

    # -- Internal conversions --------------------------------------------------

    def _to_contents(self, messages: list[LLMMessage]) -> list[Any]:
        """Convert abstract messages → Gemini ``types.Content`` list."""
        contents: list[Any] = []
        for msg in messages:
            if msg.role == "user":
                contents.append(types.Content(role="user", parts=[types.Part(text=msg.text or "")]))
            elif msg.role == "assistant":
                parts: list[Any] = []
                if msg.text:
                    parts.append(types.Part(text=msg.text))
                for fc in msg.function_calls:
                    parts.append(
                        types.Part(function_call=types.FunctionCall(name=fc.name, args=fc.args))
                    )
                if not parts:
                    parts.append(types.Part(text=""))
                contents.append(types.Content(role="model", parts=parts))
            elif msg.role == "tool":
                parts = [
                    types.Part(
                        function_response=types.FunctionResponse(name=fr.name, response=fr.response)
                    )
                    for fr in msg.function_results
                ]
                contents.append(types.Content(role="user", parts=parts))
        return contents

    def _to_gemini_tools(self, tools: list[ToolDefinition]) -> list[Any]:
        """Convert abstract tool definitions → Gemini ``types.Tool`` list."""
        declarations: list[Any] = []
        for tool in tools:
            if tool.parameters:
                properties: dict[str, Any] = {}
                required: list[str] = []
                for param_name, param_info in tool.parameters.items():
                    properties[param_name] = types.Schema(
                        type=types.Type(param_info.get("type", "STRING")),
                        description=param_info.get("description", ""),
                    )
                    required.append(param_name)
                declaration = types.FunctionDeclaration(
                    name=tool.name,
                    description=tool.description,
                    parameters=types.Schema(
                        type=types.Type.OBJECT,
                        properties=properties,
                        required=required,
                    ),
                )
            else:
                declaration = types.FunctionDeclaration(
                    name=tool.name,
                    description=tool.description,
                )
            declarations.append(declaration)
        return [types.Tool(function_declarations=declarations)]
