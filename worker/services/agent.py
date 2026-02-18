import logging
from typing import Any

from google import genai
from google.genai import types

from config import settings
from services.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)

MAX_TOOL_ITERATIONS = 3

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a helpful AI assistant. Use the available tools to look up information "
    "when the user's question could benefit from specific knowledge from the knowledge base."
)


class Agent:
    """Agent that uses Gemini's function-calling API to orchestrate tool use."""

    client: genai.Client
    tool_registry: ToolRegistry
    model_name: str

    def __init__(
        self,
        tool_registry: ToolRegistry,
        model_name: str | None = None,
    ):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.tool_registry = tool_registry
        self.model_name = model_name or settings.LLM_MODEL

    async def run(
        self,
        message: str,
        system_instruction: str | None = None,
    ) -> str:
        """Run the agent loop: generate -> execute tools -> repeat until text response."""
        contents: list[Any] = [types.Content(role="user", parts=[types.Part(text=message)])]

        gemini_tools = self._build_tools()
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or DEFAULT_SYSTEM_INSTRUCTION,
            tools=gemini_tools,
            temperature=0.7,
            max_output_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
        )

        for iteration in range(MAX_TOOL_ITERATIONS):
            logger.info(f"Agent iteration {iteration + 1}")

            response = self.client.models.generate_content(  # pyright: ignore[reportUnknownMemberType]
                model=self.model_name,
                contents=contents,
                config=config,
            )

            if not response.candidates:
                return ""

            candidate = response.candidates[0]
            response_content = candidate.content

            if response_content is None:
                return ""

            contents.append(response_content)

            function_calls = [
                part for part in (response_content.parts or []) if part.function_call is not None
            ]

            if not function_calls:
                return str(response.text or "")

            function_response_parts: list[Any] = []
            for part in function_calls:
                fc = part.function_call
                if fc is None:
                    continue
                tool_name = str(fc.name)
                tool_args: dict[str, Any] = dict(fc.args) if fc.args else {}

                logger.info(f"Tool call: {tool_name}({tool_args})")

                try:
                    result = await self.tool_registry.execute(tool_name, tool_args)
                    function_response_parts.append(
                        types.Part(
                            function_response=types.FunctionResponse(
                                name=tool_name,
                                response={"result": result},
                            )
                        )
                    )
                except Exception as e:
                    logger.error(f"Tool '{tool_name}' failed: {e}")
                    function_response_parts.append(
                        types.Part(
                            function_response=types.FunctionResponse(
                                name=tool_name,
                                response={"error": str(e)},
                            )
                        )
                    )

            contents.append(types.Content(role="user", parts=function_response_parts))

        logger.warning("Agent reached maximum tool iterations")
        return "I was unable to complete the request within the allowed number of steps."

    def _build_tools(self) -> list[Any] | None:
        """Convert registered tools to Gemini function declarations."""
        if not self.tool_registry.has_tools:
            return None

        declarations: list[Any] = []
        for tool in self.tool_registry.tools:
            params = tool.parameters
            if params:
                properties: dict[str, Any] = {}
                required: list[str] = []
                for param_name, param_info in params.items():
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
