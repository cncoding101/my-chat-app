import logging

import httpx

from business.chat import ChatService
from schemas.chat import ChatCallbackPayload, ChatTriggerRequest
from services.callback_service import send_callback

logger = logging.getLogger(__name__)


async def chat_task_orchestrator(
    request: ChatTriggerRequest,
    http_client: httpx.AsyncClient,
    chat_service: ChatService,
) -> None:
    """
    The Orchestrator (Marshall) for the background task.
    Flow: Agent/Business Logic -> Callback Service.
    """
    try:
        response_text = await chat_service.process_llm_task(request)

        callback_payload = ChatCallbackPayload(
            chatId=request.chat_id, content=response_text, status='completed'
        )

        await send_callback(http_client, str(request.callback_url), callback_payload)
    except Exception as e:
        logger.error(f'Error in chat task orchestrator for {request.chat_id}: {e}')
        error_payload = ChatCallbackPayload(
            chatId=request.chat_id, content='', status='error', error=str(e)
        )
        await send_callback(http_client, str(request.callback_url), error_payload)
