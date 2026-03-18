import logging

from config import settings
from schemas.chat import ChatTriggerRequest
from services.llm.base import LLMProvider
from services.llm.factory import LLMFactory

from .agent import DEFAULT_SYSTEM_INSTRUCTION, Agent
from .tools.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class ChatService:
    """Processes LLM tasks, choosing between agent loop and direct generation."""

    tool_registry: ToolRegistry
    default_provider: LLMProvider

    def __init__(self, tool_registry: ToolRegistry, default_provider: LLMProvider) -> None:
        self.tool_registry = tool_registry
        self.default_provider = default_provider

    async def process_llm_task(self, request: ChatTriggerRequest) -> str:
        """
        Processes the LLM task. Uses the agent loop when tools are available,
        falls back to direct LLM generation otherwise.
        """
        provider_name = request.provider or settings.LLM_PROVIDER
        logger.info(
            f'Processing LLM task for chat {request.chat_id} using provider: {provider_name}'
        )

        try:
            if request.provider:
                provider = LLMFactory.get_provider(
                    provider_name=request.provider, model_name=request.model
                )
            else:
                provider = self.default_provider

            provider = LLMFactory.get_provider(provider_name, model_name=request.model)
            system_instructions = self._build_system_instructions(request)
            if self.tool_registry.has_tools:
                agent = Agent(provider=provider, tool_registry=self.tool_registry)
                response_text = await agent.run(request.messages, system_instructions)
            else:
                response_text = await provider.generate_response(request.messages)

            logger.info(f'Successfully generated response for chat {request.chat_id}')
            return response_text

        except Exception as e:
            logger.error(f'Error processing LLM task for chat {request.chat_id}: {e!s}')
            raise e

    def _build_system_instructions(self, request: ChatTriggerRequest) -> str:
        document_names = (request.metadata or {}).get('document_names', [])

        if not document_names:
            return DEFAULT_SYSTEM_INSTRUCTION

        file_list = '\n'.join(f'- {name}' for name in document_names)
        return (
            f'{DEFAULT_SYSTEM_INSTRUCTION}\n\n'
            f'The following documents are available in the knowledge base:\n{file_list}'
        )
