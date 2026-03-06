import re

from typing_extensions import override

from .base import ChunkerStrategy


class FixedSizeChunker(ChunkerStrategy):
    chunk_size: int
    chunk_overlap: int

    def __init__(
        self,
        chunk_size: int = 200,
        chunk_overlap: int = 50,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @override
    async def chunk_text_async(self, text: str) -> list[str]:
        raise NotImplementedError('Use chunk_text instead')

    @override
    def chunk_text(self, text: str) -> list[str]:
        """Split text into overlapping chunks with header-aware splitting."""
        if not text or not text.strip():
            return []

        sections = self._header_split(text.strip())
        chunks: list[str] = []
        for header, body in sections:
            section_chunks = self._recursive_split(body, ['\n\n', '\n', '. ', '? ', '! ', ' '])
            if header:
                section_chunks = [f'{header}\n{chunk}' for chunk in section_chunks]
            chunks.extend(section_chunks)
        return chunks

    def _header_split(self, text: str) -> list[tuple[str | None, str]]:
        """Split text by markdown headers into (header, body) pairs."""
        header_pattern = re.compile(r'^(#{1,6})\s+(.+)$', re.MULTILINE)
        matches = list(header_pattern.finditer(text))

        if not matches:
            return [(None, text)]

        sections: list[tuple[str | None, str]] = []

        pre_header = text[: matches[0].start()].strip()
        if pre_header:
            sections.append((None, pre_header))

        for i, match in enumerate(matches):
            header_line = match.group(0)
            body_start = match.end()
            body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            body = text[body_start:body_end].strip()
            if body:
                sections.append((header_line, body))

        return sections

    def _recursive_split(self, text: str, separators: list[str]) -> list[str]:
        if self.count_tokens(text) <= self.chunk_size:
            return [text] if text.strip() else []

        separator = ''
        for sep in separators:
            if sep in text:
                separator = sep
                break

        if not separator:
            return self._split_by_size(text)

        splits = text.split(separator)
        chunks: list[str] = []
        current_chunk: list[str] = []
        current_length = 0

        for split in splits:
            piece = split.strip()
            if not piece:
                continue

            piece_len = self.count_tokens(piece)

            if current_length + piece_len > self.chunk_size and current_chunk:
                chunks.append(separator.join(current_chunk))

                overlap_chunks: list[str] = []
                overlap_length = 0
                for prev in reversed(current_chunk):
                    prev_len = self.count_tokens(prev)
                    if overlap_length + prev_len > self.chunk_overlap:
                        break
                    overlap_chunks.insert(0, prev)
                    overlap_length += prev_len

                current_chunk = overlap_chunks
                current_length = overlap_length

            current_chunk.append(piece)
            current_length += piece_len

        if current_chunk:
            chunks.append(separator.join(current_chunk))

        return chunks

    def _split_by_size(self, text: str) -> list[str]:
        """Fallback: split by words when no separator works."""
        words = text.split()
        chunks: list[str] = []
        start = 0
        while start < len(words):
            end = start + self.chunk_size
            chunk = ' '.join(words[start:end])
            if chunk.strip():
                chunks.append(chunk)
            start = end - self.chunk_overlap
        return chunks
