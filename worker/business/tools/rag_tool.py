import logging
from typing import Any

from pydantic import BaseModel, Field, field_validator
from typing_extensions import override

from business.rag import QueryIntent, QueryService, RetrieverService

from .base import Tool

logger = logging.getLogger(__name__)


class RAGToolInput(BaseModel):
    query: str = Field(
        ...,
        description='The search query to retrieve relevant chunks from uploaded documents.',
    )

    @field_validator('query')
    @classmethod
    def validate_query(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('query cannot be empty')
        return v


class RAGTool(Tool):
    """Searches the knowledge base for relevant information."""

    retriever_service: RetrieverService
    query_service: QueryService

    def __init__(self, retriever_service: RetrieverService, query_service: QueryService):
        self.retriever_service = retriever_service
        self.query_service = query_service

    @property
    @override
    def name(self) -> str:
        return 'search_knowledge_base'

    @property
    @override
    def description(self) -> str:
        return (
            'Search through uploaded documents and files in the knowledge base. '
            'This is how you access the contents of any file the user has uploaded '
            'Always use this tool when the user asks about, references, or wants information from their documents.'
        )

    @property
    @override
    def input_schema(self) -> type[RAGToolInput]:
        return RAGToolInput

    @override
    async def execute(self, **kwargs: Any) -> str:
        validated = RAGToolInput.model_validate(kwargs)

        try:
            intent = await self.query_service.classify(validated.query)
            logger.info(f'Query intent: {intent.value} for query: {validated.query}')

            if intent == QueryIntent.BROAD:
                results = await self.retriever_service.search_summaries(validated.query)
            else:
                results = await self.retriever_service.search(validated.query)
        except Exception as e:
            logger.error(f'Knowledge base search failed: {e}')
            return 'Something went wrong while searching the knowledge base. The documents may need to be re-ingested.'

        if not results:
            return 'No relevant information found in the knowledge base.'

        formatted = '\n\n---\n\n'.join(
            f'[Result {i + 1} — {r["filename"]}]\n{r["text"]}' for i, r in enumerate(results)
        )
        return f'Found {len(results)} relevant results:\n\n{formatted}'
