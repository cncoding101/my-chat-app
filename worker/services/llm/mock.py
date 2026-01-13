import asyncio
from typing import Optional, List
from .base import LLMProvider

class MockProvider(LLMProvider):
    """
    Mock implementation of LLMProvider for testing and experiments.
    Returns predefined or echoed responses without calling any external API.
    """

    async def generate_response(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        history: Optional[List[dict]] = None,
        **kwargs
    ) -> str:
        """
        Simulates a response from an LLM.
        """
        # Simulate some latency
        await asyncio.sleep(kwargs.get("delay", 0.5))
        
        # Determine response style from prompt or metadata
        if "error" in prompt.lower():
            raise Exception("Mock provider simulated error")
            
        response_text = f"Mock response to: '{prompt}'"
        
        if system_instruction:
            response_text = f"[System: {system_instruction}] {response_text}"
            
        return response_text

