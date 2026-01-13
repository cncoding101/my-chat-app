from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any

class ChatTriggerRequest(BaseModel):
    """Payload sent from App to Worker to trigger an LLM task."""
    chat_id: str
    message: str
    callback_url: HttpUrl
    provider: Optional[str] = "gemini"  # e.g., "gemini", "mock"
    model: Optional[str] = None         # specific model name
    metadata: Optional[Dict[str, Any]] = None

class ChatCallbackPayload(BaseModel):
    """Payload sent from Worker back to App when task is complete."""
    chat_id: str
    response: str
    status: str = "completed"
    error: Optional[str] = None

