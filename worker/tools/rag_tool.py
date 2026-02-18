from typing import Any

from typing_extensions import override

from services.rag.retriever import Retriever
from tools.base import Tool


class RAGTool(Tool):
    """Searches the knowledge base for relevant information."""

    retriever: Retriever

    def __init__(self, retriever: Retriever):
        self.retriever = retriever

    @property
    @override
    def name(self) -> str:
        return "search_knowledge_base"

    @property
    @override
    def description(self) -> str:
        return (
            "Search the knowledge base for relevant information about a topic. "
            "Use this when you need to look up specific facts, details, or context "
            "from ingested documents."
        )

    @property
    @override
    def parameters(self) -> dict[str, dict[str, str]]:
        return {
            "query": {
                "type": "STRING",
                "description": "The search query to find relevant documents",
            }
        }

    @override
    async def execute(self, **kwargs: Any) -> str:
        query = kwargs.get("query", "")
        if not query:
            return "Error: No search query provided."

        results = await self.retriever.search(query)

        if not results:
            return "No relevant information found in the knowledge base."

        formatted = "\n\n---\n\n".join(
            f"[Result {i + 1}]\n{text}" for i, text in enumerate(results)
        )
        return f"Found {len(results)} relevant results:\n\n{formatted}"
