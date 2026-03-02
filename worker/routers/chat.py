from typing import Annotated

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends

from business.chat import ChatService
from controllers.chat_controller import chat_task_orchestrator
from dependencies import get_chat_service, get_http_client
from schemas.chat import ChatCallbackPayload, ChatTriggerRequest, ChatTriggerResponse

router = APIRouter(prefix='/chats', tags=['chats'])

HttpClient = Annotated[httpx.AsyncClient, Depends(get_http_client)]
Chat = Annotated[ChatService, Depends(get_chat_service)]


@router.post('/trigger', response_model=ChatTriggerResponse, operation_id='triggerChat')
async def trigger_chat(
    request: ChatTriggerRequest,
    background_tasks: BackgroundTasks,
    http_client: HttpClient,
    chat_service: Chat,
) -> ChatTriggerResponse:
    """
    Endpoint for the App to trigger a new LLM task.
    Uses the agent loop with tool calling when tools are registered.
    """
    background_tasks.add_task(chat_task_orchestrator, request, http_client, chat_service)
    return ChatTriggerResponse(status='accepted', chatId=request.chat_id)


@router.post(
    '/callback-schema-discovery',
    response_model=ChatCallbackPayload,
    tags=['_schema'],
    operation_id='callbackSchemaDiscovery',
)
async def callback_schema_discovery(payload: ChatCallbackPayload) -> ChatCallbackPayload:
    """
    Endpoint used ONLY for generating the callback payload type in the frontend SDK.
    """
    return payload
