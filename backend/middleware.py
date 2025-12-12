from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Iterable


def register_cors(app: FastAPI, origins: Iterable[str]) -> None:
    """Attach a permissive CORS middleware for the provided origins."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


__all__ = ["register_cors"]
