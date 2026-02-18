import logging

import fitz
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def parse_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    pages: list[str] = []
    for page in doc:
        text = str(page.get_text())  # pyright: ignore[reportUnknownMemberType, reportUnknownArgumentType]
        if text.strip():
            pages.append(text)
    doc.close()
    return "\n\n".join(pages)


def parse_text(content: bytes) -> str:
    return content.decode("utf-8", errors="replace")


def parse_html(html: str) -> str:
    soup: BeautifulSoup = BeautifulSoup(html, "html.parser")

    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()

    return str(soup.get_text(separator="\n", strip=True))


async def fetch_and_parse_url(url: str, http_client: httpx.AsyncClient) -> str:
    response = await http_client.get(url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    return parse_html(response.text)


def parse_document(content: bytes, filename: str, content_type: str | None = None) -> str:
    ct = (content_type or "").lower()
    name = filename.lower()

    if ct == "application/pdf" or name.endswith(".pdf"):
        return parse_pdf(content)

    if ct in ("text/markdown", "text/x-markdown") or name.endswith((".md", ".markdown")):
        return parse_text(content)

    if ct.startswith("text/") or name.endswith((".txt", ".csv", ".json", ".xml", ".yaml", ".yml")):
        return parse_text(content)

    if ct == "text/html" or name.endswith((".html", ".htm")):
        return parse_html(content.decode("utf-8", errors="replace"))

    logger.warning(f"Unknown content type '{ct}' for '{filename}', attempting text extraction")
    return parse_text(content)
