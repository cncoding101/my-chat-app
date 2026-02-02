import logging

from schemas.chat import ChatTriggerRequest
from services.llm.factory import LLMFactory

logger = logging.getLogger(__name__)


class ChatBusiness:
    @staticmethod
    async def process_llm_task(request: ChatTriggerRequest) -> str:
        """
        Processes the LLM task by selecting the appropriate provider
        via the factory and generating a response.
        """
        logger.info(
            f"Processing LLM task for chat {request.chat_id} using provider: {request.provider}"
        )

        try:
            # 1. Get the provider from the factory (defaulting to gemini if not specified)
            provider_name = request.provider or "gemini"
            provider = LLMFactory.get_provider(provider_name, model_name=request.model)

            # 2. Generate the response
            # Note: We can add more logic here later for system prompts, history, etc.
            response_text = await provider.generate_response(
                prompt=request.message,
                # system_instruction="You are a helpful chat assistant.",
            )

            logger.info(f"Successfully generated response for chat {request.chat_id}")
            return response_text

        except Exception as e:
            logger.error(f"Error processing LLM task for chat {request.chat_id}: {e!s}")
            # Re-raise to be handled by the controller's error handling
            raise e
