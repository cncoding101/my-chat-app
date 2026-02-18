import logging

from config import settings
from services.llm.base import LLMProvider
from services.llm.types import FunctionResult, LLMMessage, ToolDefinition
from services.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)

MAX_TOOL_ITERATIONS = 3

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a helpful AI assistant. Use the available tools to look up information "
    "when the user's question could benefit from specific knowledge from the knowledge base."
)


class Agent:
    """Provider-agnostic agent that orchestrates tool-calling loops."""

    provider: LLMProvider
    tool_registry: ToolRegistry

    def __init__(
        self,
        provider: LLMProvider,
        tool_registry: ToolRegistry,
    ):
        self.provider = provider
        self.tool_registry = tool_registry

    async def run(
        self,
        message: str,
        system_instruction: str | None = None,
    ) -> str:
        """Run the agent loop: generate -> execute tools -> repeat until text response."""
        messages: list[LLMMessage] = [LLMMessage(role="user", text=message)]
        tool_defs = self._build_tool_definitions()

        for iteration in range(MAX_TOOL_ITERATIONS):
            logger.info(f"Agent iteration {iteration + 1}")

            response = await self.provider.generate_with_tools(
                messages=messages,
                tools=tool_defs,
                system_instruction=system_instruction or DEFAULT_SYSTEM_INSTRUCTION,
                temperature=0.7,
                max_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
            )

            messages.append(
                LLMMessage(
                    role="assistant",
                    text=response.text,
                    function_calls=response.function_calls,
                )
            )

            if not response.has_function_calls:
                return response.text or ""

            function_results: list[FunctionResult] = []
            for fc in response.function_calls:
                logger.info(f"Tool call: {fc.name}({fc.args})")
                try:
                    result = await self.tool_registry.execute(fc.name, fc.args)
                    function_results.append(
                        FunctionResult(name=fc.name, response={"result": result})
                    )
                except Exception as e:
                    logger.error(f"Tool '{fc.name}' failed: {e}")
                    function_results.append(
                        FunctionResult(name=fc.name, response={"error": str(e)})
                    )

            messages.append(LLMMessage(role="tool", function_results=function_results))

        logger.warning("Agent reached maximum tool iterations")
        return "I was unable to complete the request within the allowed number of steps."

    def _build_tool_definitions(self) -> list[ToolDefinition] | None:
        """Convert registered tools to provider-agnostic definitions."""
        if not self.tool_registry.has_tools:
            return None

        return [
            ToolDefinition(
                name=tool.name,
                description=tool.description,
                parameters=tool.parameters or None,
            )
            for tool in self.tool_registry.tools
        ]
