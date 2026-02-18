import logging

from config import settings
from schemas.chat import ChatTriggerRequest
from services.agent import Agent
from services.llm.factory import LLMFactory
from services.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


async def process_llm_task(
    request: ChatTriggerRequest,
    tool_registry: ToolRegistry | None = None,
) -> str:
    """
    Processes the LLM task. Uses the agent loop when tools are available,
    falls back to direct LLM generation otherwise.
    """
    provider_name = request.provider or settings.LLM_PROVIDER
    logger.info(f"Processing LLM task for chat {request.chat_id} using provider: {provider_name}")

    try:
        provider = LLMFactory.get_provider(provider_name, model_name=request.model)

        if tool_registry and tool_registry.has_tools:
            agent = Agent(provider=provider, tool_registry=tool_registry)
            response_text = await agent.run(request.message)
        else:
            response_text = await provider.generate_response(prompt=request.message)

        logger.info(f"Successfully generated response for chat {request.chat_id}")
        return response_text

    except Exception as e:
        logger.error(f"Error processing LLM task for chat {request.chat_id}: {e!s}")
        raise e
