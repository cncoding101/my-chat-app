import logging
from typing import Any

from tools.base import Tool

logger = logging.getLogger(__name__)


class ToolRegistry:
    """Registry for managing and dispatching agent tools."""

    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        logger.info(f"Registering tool: {tool.name}")
        self._tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' not found in registry")
        return self._tools[name]

    async def execute(self, name: str, args: dict[str, Any]) -> str:
        tool = self.get(name)
        logger.info(f"Executing tool '{name}' with args: {args}")
        return await tool.execute(**args)

    @property
    def tools(self) -> list[Tool]:
        return list(self._tools.values())

    @property
    def has_tools(self) -> bool:
        return len(self._tools) > 0
