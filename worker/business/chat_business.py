import logging
from schemas.chat import ChatTriggerRequest

logger = logging.getLogger(__name__)

class ChatBusiness:
    @staticmethod
    async def process_llm_task(request: ChatTriggerRequest) -> str:
        """
        The actual heavy lifting / business logic.
        This is where LLM calls or complex processing happens.
        """
        logger.info(f"Business logic processing for chat {request.chat_id}")
        
        # In the future, this is where you'd call OpenAI/Anthropic
        return f"Echo: {request.message}. (Processed by Business Layer)"

