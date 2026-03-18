from schemas.chat import ChatMessage
from services.llm import LLMProvider

SYSTEM_PROMPT = 'Summarize this document and return the result'


class SummaryService:
    llm_provider: LLMProvider

    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider

    async def summarize(self, text: str) -> str:
        messages: list[ChatMessage] = [ChatMessage(role='user', content=text)]

        response = await self.llm_provider.generate_response(
            messages, system_instruction=SYSTEM_PROMPT
        )

        return response
