from enum import Enum


class Environment(str, Enum):
    """Application environment modes."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
