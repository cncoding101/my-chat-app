import logging
from enum import Enum

from schemas.chat import ChatMessage
from services.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class QueryIntent(Enum):
    SPECIFIC = 'specific'
    BROAD = 'broad'
    COMPARATIVE = 'comparative'


CLASSIFICATION_PROMPT = """
Classify the user's query into one of three categories:
- SPECIFIC: looking for a particular fact, detail, or passage
- BROAD: asking for an overview, summary, or general understanding
- COMPARATIVE: comparing multiple documents or topics

Reply with ONLY the category name: SPECIFIC, BROAD, or COMPARATIVE
"""


class QueryService:
    llm_provider: LLMProvider

    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider

    async def classify(self, query: str) -> QueryIntent:
        messages = [ChatMessage(role='user', content=query)]

        response = await self.llm_provider.generate_response(
            messages, system_instruction=CLASSIFICATION_PROMPT
        )

        raw = (response or '').strip().upper()
        logger.info(f'Query classification: "{raw}" for query: "{query}"')

        try:
            return QueryIntent[raw]
        except KeyError:
            logger.warning(f'Unknown classification "{raw}", defaulting to SPECIFIC')
            return QueryIntent.SPECIFIC
