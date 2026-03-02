def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[str]:
    """Split text into overlapping chunks using recursive character splitting."""
    if not text or not text.strip():
        return []

    separators = ["\n\n", "\n", ". ", " "]
    return _recursive_split(text.strip(), separators, chunk_size, chunk_overlap)


def _recursive_split(
    text: str,
    separators: list[str],
    chunk_size: int,
    chunk_overlap: int,
) -> list[str]:
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    separator = ""
    for sep in separators:
        if sep in text:
            separator = sep
            break

    if not separator:
        return _split_by_size(text, chunk_size, chunk_overlap)

    splits = text.split(separator)
    chunks: list[str] = []
    current_chunk: list[str] = []
    current_length = 0

    for split in splits:
        piece = split.strip()
        if not piece:
            continue

        piece_len = len(piece)

        if current_length + piece_len + len(separator) > chunk_size and current_chunk:
            chunks.append(separator.join(current_chunk))

            overlap_chunks: list[str] = []
            overlap_length = 0
            for prev in reversed(current_chunk):
                if overlap_length + len(prev) > chunk_overlap:
                    break
                overlap_chunks.insert(0, prev)
                overlap_length += len(prev) + len(separator)

            current_chunk = overlap_chunks
            current_length = overlap_length

        current_chunk.append(piece)
        current_length += piece_len + len(separator)

    if current_chunk:
        chunks.append(separator.join(current_chunk))

    return chunks


def _split_by_size(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - chunk_overlap
    return chunks
