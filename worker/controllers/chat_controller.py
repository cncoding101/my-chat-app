import logging

import httpx

from business.chat_business import process_llm_task
from schemas.chat import ChatCallbackPayload, ChatTriggerRequest
from services.callback_service import send_callback

logger = logging.getLogger(__name__)


async def chat_task_orchestrator(
    request: ChatTriggerRequest,
    http_client: httpx.AsyncClient,
) -> None:
    """
    The Orchestrator (Marshall) for the background task.
    Flow: Business Logic -> Callback Service.
    """
    try:
        # 1. Call Business Logic
        response_text = await process_llm_task(request)

        # 2. Prepare Payload
        callback_payload = ChatCallbackPayload(
            chatId=request.chat_id, response=response_text, status="completed"
        )

        # 3. Call Callback Service
        await send_callback(http_client, str(request.callback_url), callback_payload)
    except Exception as e:
        logger.error(f"Error in chat task orchestrator for {request.chat_id}: {e}")
        # Send an error callback
        error_payload = ChatCallbackPayload(
            chatId=request.chat_id, response="", status="error", error=str(e)
        )
        await send_callback(http_client, str(request.callback_url), error_payload)
