"""
FastAPI dependency providers.

Each function here acts as a factory that FastAPI calls via Depends()
to inject the required service into a route handler.
"""

import httpx
from fastapi import Request

from services.rag.ingestion import IngestionService
from services.tool_registry import ToolRegistry


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_tool_registry(request: Request) -> ToolRegistry:
    return request.app.state.tool_registry


def get_ingestion_service(request: Request) -> IngestionService:
    return request.app.state.ingestion_service
