import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from config import settings
from routers.chat import router as chat_router

# Configure logging based on settings
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup logic
    logger.info(f"Starting worker in {settings.ENVIRONMENT.value} mode")
    yield
    logger.info("Shutting down worker")


app = FastAPI(title="Chat App Worker", lifespan=lifespan)

app.include_router(chat_router)


@app.get("/")
def read_root():
    return {"message": "Chat App Worker API"}
