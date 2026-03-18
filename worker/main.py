import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from qdrant_client import AsyncQdrantClient

from business.chat import ChatService
from business.rag import IngestionService, QueryService, RetrieverService, SummaryService
from business.rag.chunker import ChunkerFactory
from business.tools.rag_tool import RAGTool
from business.tools.tool_registry import ToolRegistry
from config import settings
from routers.chat import router as chat_router
from routers.documents import router as documents_router
from services.embedding import EmbeddingFactory
from services.llm.factory import LLMFactory
from services.rag.vector_store import VectorStore

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f'Starting worker in {settings.ENVIRONMENT.value} mode')

    app.state.http_client = httpx.AsyncClient()

    qdrant_client = AsyncQdrantClient(url=settings.QDRANT_URL)

    embedding_provider = EmbeddingFactory.get_provider(
        settings.EMBEDDING_PROVIDER, settings.EMBEDDING_MODEL
    )
    vector_store = VectorStore(
        vector_size=embedding_provider.dimensions,
        client=qdrant_client,
        collection_name=settings.QDRANT_COLLECTION,
    )
    await vector_store.ensure_collection()

    retriever_service = RetrieverService(vector_store, embedding_provider, top_k=10)
    chunker_strategy = ChunkerFactory.get_strategy(
        strategy=settings.CHUNKER_STRATEGY,
        embedding_provider=embedding_provider,
    )
    llm_provider = LLMFactory.get_provider(
        provider_name=settings.LLM_PROVIDER, model_name=settings.LLM_MODEL
    )
    summary_service = SummaryService(llm_provider)
    query_service = QueryService(llm_provider)

    ingestion_service = IngestionService(
        embedding_provider, chunker_strategy, vector_store, summary_service
    )

    tool_registry = ToolRegistry()
    tool_registry.register(RAGTool(retriever_service, query_service))

    chat_service = ChatService(tool_registry, llm_provider)

    app.state.qdrant_client = qdrant_client
    app.state.embedding_provider = embedding_provider
    app.state.vector_store = vector_store
    app.state.ingestion_service = ingestion_service
    app.state.chat_service = chat_service

    logger.info('Worker initialized with RAG tool')

    yield

    await qdrant_client.close()
    await app.state.http_client.aclose()
    logger.info('Shutting down worker')


app = FastAPI(title='Chat App Worker', lifespan=lifespan)

app.include_router(chat_router)
app.include_router(documents_router)


@app.get('/')
def read_root():
    return {'message': 'Chat App Worker API'}
