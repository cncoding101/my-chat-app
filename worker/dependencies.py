"""
FastAPI dependency providers.

Each function here acts as a factory that FastAPI calls via Depends()
to inject the required service into a route handler.
"""

import httpx
from fastapi import Request


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client
