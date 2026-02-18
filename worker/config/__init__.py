"""
Configuration module for the worker application.

Exports a singleton settings instance that validates environment variables
on import. If required variables are missing, the application will fail
fast with a clear error message.
"""

from pydantic import ValidationError

from config.constants import Environment
from config.settings import Settings

try:
    settings = Settings()  # pyright: ignore[reportCallIssue]
except ValidationError as e:
    errors: list[str] = []
    for error in e.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = str(error["msg"])
        errors.append(f"  - {field}: {message}")

    error_message = "Environment validation failed:\n" + "\n".join(errors)
    raise SystemExit(error_message) from e

__all__ = ["Environment", "Settings", "settings"]
