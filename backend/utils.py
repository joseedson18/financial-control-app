from typing import Any


class ValidationError(ValueError):
    """Raised when numeric validation fails."""


def validate_numeric(value: Any, allow_none: bool = False) -> float:
    """Validate that a value can be safely converted to a float.

    Args:
        value: The input that should represent a number.
        allow_none: Whether ``None`` is allowed (returns ``None`` when True).

    Returns:
        float: The converted numeric value.

    Raises:
        ValidationError: If the value cannot be converted or is missing when required.
    """

    if value is None:
        if allow_none:
            return None  # type: ignore[return-value]
        raise ValidationError("Value cannot be None")

    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f"Invalid numeric value: {value}") from exc


__all__ = ["validate_numeric", "ValidationError"]
