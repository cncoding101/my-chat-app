"""
FastAPI dependency providers.

Each function here acts as a factory that FastAPI calls via Depends()
to inject the required service into a route handler.
"""

import httpx
from fastapi import Request

from business.chat import ChatService
from business.rag.ingestion import IngestionService
from services.rag.vector_store import VectorStore


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_chat_service(request: Request) -> ChatService:
    return request.app.state.chat_service


def get_ingestion_service(request: Request) -> IngestionService:
    return request.app.state.ingestion_service


def get_vector_store(request: Request) -> VectorStore:
    return request.app.state.vector_store
