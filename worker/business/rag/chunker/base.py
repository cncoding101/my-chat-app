from abc import ABC, abstractmethod

from pydantic.dataclasses import dataclass


@dataclass
class ChunkResult:
    text: str
    parent_text: str | None = None
    parent_index: int | None = None
    chunk_type: str = 'child'


class ChunkerStrategy(ABC):
    @abstractmethod
    async def chunk(self, text: str) -> list[ChunkResult]: ...

    @staticmethod
    def count_tokens(text: str) -> int:
        return len(text.split())
