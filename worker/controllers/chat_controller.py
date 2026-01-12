import logging
from fastapi import BackgroundTasks
from schemas.chat import ChatTriggerRequest, ChatCallbackPayload
from business.chat_business import ChatBusiness
from services.callback_service import send_callback

logger = logging.getLogger(__name__)

async def chat_task_orchestrator(request: ChatTriggerRequest):
    """
    The Orchestrator (Marshall) for the background task.
    Flow: Business Logic -> Callback Service.
    """
    try:
        # 1. Call Business Logic
        response_text = await ChatBusiness.process_llm_task(request)
        
        # 2. Prepare Payload
        callback_payload = ChatCallbackPayload(
            chat_id=request.chat_id,
            response=response_text,
            status="completed"
        )
        
        # 3. Call Callback Service
        await send_callback(str(request.callback_url), callback_payload)
    except Exception as e:
        logger.error(f"Error in chat task orchestrator for {request.chat_id}: {e}")
        # Optionally send an error callback
        error_payload = ChatCallbackPayload(
            chat_id=request.chat_id,
            response="",
            status="error",
            error=str(e)
        )
        await send_callback(str(request.callback_url), error_payload)

class ChatController:
    @staticmethod
    async def trigger_chat(request: ChatTriggerRequest, background_tasks: BackgroundTasks):
        """
        Guides the flow of the initial request (The Marshall).
        """
        background_tasks.add_task(chat_task_orchestrator, request)
        return {"status": "accepted", "chat_id": request.chat_id}
