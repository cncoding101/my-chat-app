from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


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
    @abstractmethod
    def input_schema(self) -> type[BaseModel]:
        """Pydantic model defining and validating the tool's input parameters."""
        ...

    @property
    def parameters(self) -> dict[str, dict[str, str]]:
        """Parameter definitions derived from input_schema for LLM tool definitions."""
        params: dict[str, dict[str, str]] = {}
        for field_name, field_info in self.input_schema.model_fields.items():
            params[field_name] = {
                'type': 'STRING',
                'description': field_info.description or '',
            }
        return params

    @abstractmethod
    async def execute(self, **kwargs: Any) -> str:
        """Execute the tool and return a string result."""
        ...
