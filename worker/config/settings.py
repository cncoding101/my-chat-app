from typing import ClassVar

from pydantic_settings import (  # pyright: ignore[reportMissingImports]
    BaseSettings,
    SettingsConfigDict,
)

from config.constants import Environment


class Settings(BaseSettings):  # pyright: ignore[reportUntypedBaseClass]
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
    GOOGLE_API_KEY: str

    # HTTP client settings
    CALLBACK_TIMEOUT: int = 30

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENVIRONMENT == Environment.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENVIRONMENT == Environment.PRODUCTION
