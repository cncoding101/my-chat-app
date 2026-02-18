from typing import Annotated

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends

from controllers.chat_controller import chat_task_orchestrator
from dependencies import get_http_client
from schemas.chat import ChatCallbackPayload, ChatTriggerRequest, ChatTriggerResponse

router = APIRouter(prefix="/chats", tags=["chats"])

HttpClient = Annotated[httpx.AsyncClient, Depends(get_http_client)]


@router.post("/trigger", response_model=ChatTriggerResponse, operation_id="triggerChat")
async def trigger_chat(
    request: ChatTriggerRequest,
    background_tasks: BackgroundTasks,
    http_client: HttpClient,
) -> ChatTriggerResponse:
    """
    Endpoint for the App to trigger a new LLM task.
    Guides the flow of the initial request (The Marshall).
    """
    background_tasks.add_task(chat_task_orchestrator, request, http_client)
    return ChatTriggerResponse(status="accepted", chatId=request.chat_id)


@router.post(
    "/callback-schema-discovery",
    response_model=ChatCallbackPayload,
    tags=["_schema"],
    operation_id="callbackSchemaDiscovery",
)
async def callback_schema_discovery(payload: ChatCallbackPayload) -> ChatCallbackPayload:
    """
    Endpoint used ONLY for generating the callback payload type in the frontend SDK.
    """
    return payload
