import httpx


async def fetch_url(url: str, http_client: httpx.AsyncClient) -> str:
    """Fetch raw HTML content from a URL."""
    response = await http_client.get(url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    return response.text
