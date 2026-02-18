from abc import ABC, abstractmethod
from typing import Any


class Tool(ABC):
    """Abstract base class for agent tools."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier for this tool."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what this tool does, shown to the LLM."""
        ...

    @property
    def parameters(self) -> dict[str, dict[str, str]]:
        """Parameter definitions as {name: {type, description}}."""
        return {}

    @abstractmethod
    async def execute(self, **kwargs: Any) -> str:
        """Execute the tool and return a string result."""
        ...
