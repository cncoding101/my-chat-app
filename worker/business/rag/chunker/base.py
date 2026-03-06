from abc import ABC, abstractmethod


class ChunkerStrategy(ABC):
    @abstractmethod
    def chunk_text(self, text: str) -> list[str]: ...

    @abstractmethod
    async def chunk_text_async(self, text: str) -> list[str]: ...

    @staticmethod
    def count_tokens(text: str) -> int:
        return len(text.split())
