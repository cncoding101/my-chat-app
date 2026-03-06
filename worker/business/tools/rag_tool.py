from typing import Any

from pydantic import BaseModel, Field, field_validator
from typing_extensions import override

from business.rag import RetrieverService

from .base import Tool


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

    def __init__(self, retriever_service: RetrieverService):
        self.retriever_service = retriever_service

    @property
    @override
    def name(self) -> str:
        return 'search_knowledge_base'

    @property
    @override
    def description(self) -> str:
        return (
            'Search the knowledge base for relevant information about a topic. '
            'Use this when you need to look up specific facts, details, or context '
            'from ingested documents.'
        )

    @property
    @override
    def input_schema(self) -> type[RAGToolInput]:
        return RAGToolInput

    @override
    async def execute(self, **kwargs: Any) -> str:
        validated = RAGToolInput.model_validate(kwargs)

        results = await self.retriever_service.search(validated.query)

        if not results:
            return 'No relevant information found in the knowledge base.'

        formatted = '\n\n---\n\n'.join(
            f'[Result {i + 1}]\n{text}' for i, text in enumerate(results)
        )
        return f'Found {len(results)} relevant results:\n\n{formatted}'
