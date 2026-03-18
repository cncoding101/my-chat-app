from typing import Any

from pydantic import BaseModel, HttpUrl, field_validator


class ChatMessage(BaseModel):
    """A single message in a chat conversation."""

    role: str
    content: str

    @field_validator('role')
    @classmethod
    def normalized_role(cls, v: str) -> str:
        return v.lower()


class ChatTriggerRequest(BaseModel):
    """Payload sent from App to Worker to trigger an LLM task."""

    chat_id: str
    messages: list[ChatMessage]
    callback_url: HttpUrl
    provider: str | None = None  # e.g., "gemini", "ollama", "mock" — defaults to LLM_PROVIDER
    model: str | None = None  # specific model name
    metadata: dict[str, Any] | None = None


class ChatTriggerResponse(BaseModel):
    """Response returned when an LLM task is accepted."""

    status: str
    chatId: str  # noqa: N815


class ChatCallbackPayload(BaseModel):
    """Payload sent from Worker back to App when task is complete."""

    chatId: str  # noqa: N815
    content: str
    status: str = 'completed'
    error: str | None = None
