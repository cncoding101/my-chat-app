from typing import Any

from pydantic import BaseModel, HttpUrl


class ChatTriggerRequest(BaseModel):
    """Payload sent from App to Worker to trigger an LLM task."""

    chat_id: str
    message: str
    callback_url: HttpUrl
    provider: str | None = "gemini"  # e.g., "gemini", "mock"
    model: str | None = None  # specific model name
    metadata: dict[str, Any] | None = None


class ChatTriggerResponse(BaseModel):
    """Response returned when an LLM task is accepted."""

    status: str
    chatId: str  # noqa: N815


class ChatCallbackPayload(BaseModel):
    """Payload sent from Worker back to App when task is complete."""

    chatId: str  # noqa: N815
    response: str
    status: str = "completed"
    error: str | None = None
