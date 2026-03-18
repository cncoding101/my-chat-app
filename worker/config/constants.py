from enum import Enum


class Environment(Enum):
    """Application environment modes."""

    DEVELOPMENT = 'development'
    STAGING = 'staging'
    PRODUCTION = 'production'
