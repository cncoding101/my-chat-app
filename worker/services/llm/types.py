from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class FunctionCall:
    """A function call requested by the LLM."""

    name: str
    args: dict[str, Any]


@dataclass
class FunctionResult:
    """The result of executing a function call."""

    name: str
    response: dict[str, Any]


@dataclass
class LLMMessage:
    """Provider-agnostic conversation message."""

    role: str
    text: str | None = None
    function_calls: list[FunctionCall] = field(default_factory=list)
    function_results: list[FunctionResult] = field(default_factory=list)


@dataclass
class LLMResponse:
    """Response from an LLM generation call."""

    text: str | None = None
    function_calls: list[FunctionCall] = field(default_factory=list)

    @property
    def has_function_calls(self) -> bool:
        return len(self.function_calls) > 0


@dataclass
class ToolDefinition:
    """Provider-agnostic tool definition for function calling."""

    name: str
    description: str
    parameters: dict[str, dict[str, str]] | None = None
