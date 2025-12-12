import logging
import os
from typing import Optional

from dotenv import load_dotenv

# Ensure environment variables from a local .env are available for the app.
load_dotenv()

# Default environment name, primarily used for diagnostics and deployment metadata.
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

# Configure a shared application logger with a configurable level.
_default_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
_default_level: Optional[int] = getattr(logging, _default_level_name, logging.INFO)
logging.basicConfig(level=_default_level)
logger = logging.getLogger("financial_control_app")

__all__ = ["ENVIRONMENT", "logger"]
