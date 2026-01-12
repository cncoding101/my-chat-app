from fastapi import APIRouter, BackgroundTasks
from schemas.chat import ChatTriggerRequest, ChatCallbackPayload
from controllers.chat_controller import ChatController

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/trigger")
async def trigger_chat(request: ChatTriggerRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for the App to trigger a new LLM task.
    """
    return await ChatController.trigger_chat(request, background_tasks)

@router.post("/callback-schema-discovery", tags=["_schema"])
async def callback_schema_discovery(payload: ChatCallbackPayload):
    """
    Endpoint used ONLY for generating the callback payload type in the frontend SDK.
    """
    return payload
