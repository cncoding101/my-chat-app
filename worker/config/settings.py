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
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application settings
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    LOG_LEVEL: str = "INFO"

    # LLM settings
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-2.0-flash-lite"
    LLM_MAX_OUTPUT_TOKENS: int = 1024

    # Google Gemini settings (required when LLM_PROVIDER=gemini)
    GOOGLE_API_KEY: str = ""

    # Ollama settings (used when LLM_PROVIDER=ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # HTTP client settings
    CALLBACK_TIMEOUT: int = 30

    # Qdrant settings
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "documents"

    # Embedding settings
    EMBEDDING_MODEL: str = "gemini-embedding-001"

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == Environment.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == Environment.PRODUCTION
