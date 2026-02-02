from fastapi import APIRouter, BackgroundTasks

from controllers.chat_controller import ChatController
from schemas.chat import ChatCallbackPayload, ChatTriggerRequest

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/trigger", operation_id="triggerChat")
async def trigger_chat(request: ChatTriggerRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for the App to trigger a new LLM task.
    """
    return await ChatController.trigger_chat(request, background_tasks)

@router.post("/callback-schema-discovery", tags=["_schema"], operation_id="callbackSchemaDiscovery")
async def callback_schema_discovery(payload: ChatCallbackPayload):
    """
    Endpoint used ONLY for generating the callback payload type in the frontend SDK.
    """
    return payload
