from typing import Any, Dict


def success_response(data: Any = None, message: str = "OK") -> Dict[str, Any]:
    """Standard success envelope used by helper scripts."""
    return {"status": "success", "message": message, "data": data}


def error_response(message: str, details: Any = None, *, status_code: int = 400) -> Dict[str, Any]:
    """Standard error envelope used by helper scripts."""
    return {"status": "error", "message": message, "details": details, "code": status_code}


__all__ = ["success_response", "error_response"]
