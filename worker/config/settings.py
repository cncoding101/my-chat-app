from typing import ClassVar

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)

from config.constants import Environment


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Uses pydantic-settings for validation and type safety.
    Variables are loaded from .env file and environment.
    """

    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore',
    )

    # Application settings
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    LOG_LEVEL: str = 'INFO'

    # LLM settings (required — must be set in .env or environment)
    LLM_PROVIDER: str
    LLM_MODEL: str
    LLM_MAX_OUTPUT_TOKENS: int

    # Google Gemini settings (required when LLM_PROVIDER=gemini)
    GOOGLE_API_KEY: str = ''

    # Ollama settings (used when LLM_PROVIDER=ollama)
    OLLAMA_BASE_URL: str = 'http://localhost:11434'

    # HTTP client settings
    CALLBACK_TIMEOUT: int = 30

    # Qdrant settings
    QDRANT_URL: str = 'http://localhost:6333'
    QDRANT_COLLECTION: str = 'documents'

    # Embedding settings
    EMBEDDING_PROVIDER: str
    EMBEDDING_MODEL: str
    EMBEDDING_DIMENSIONS: int

    # Tokenizer settings
    TOKENIZER_PROVIDER: str = 'whitespace'

    # Chunker settings
    CHUNKER_STRATEGY: str
    CHUNKER_CHUNK_SIZE: int = 200
    CHUNKER_CHUNK_OVERLAP: int = 50
    CHUNKER_SIMILARITY_THRESHOLD: float = 0.6
    CHUNKER_MAX_CHUNKS_TOKENS: int = 500
    CHUNKER_MIN_CHUNKS_TOKENS: int = 50

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == Environment.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == Environment.PRODUCTION
