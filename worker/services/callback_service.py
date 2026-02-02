import logging

import httpx

from schemas.chat import ChatCallbackPayload

logger = logging.getLogger(__name__)

async def send_callback(callback_url: str, payload: ChatCallbackPayload):
    """
    Sends a POST request to the specified callback URL with the given payload.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                callback_url,
                json=payload.model_dump()
            )

            response.raise_for_status()
            logger.info(f"Successfully sent callback to {callback_url}")
            return True
        except Exception as e:
            logger.error(f"Failed to send callback to {callback_url}: {e}")
            return False

