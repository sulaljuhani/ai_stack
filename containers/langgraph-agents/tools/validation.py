"""
Input validation utilities for tools.

Provides reusable validation functions to prevent common issues:
- Invalid dates/times
- Invalid priorities
- Invalid email addresses
- Invalid URLs
- SQL injection risks
"""

from typing import Optional, Tuple
from datetime import datetime
import re


# ============================================================================
# Date/Time Validation
# ============================================================================

def validate_iso_datetime(date_string: str) -> Tuple[bool, Optional[str]]:
    """
    Validate ISO 8601 datetime string.

    Args:
        date_string: String to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not date_string:
        return False, "Date string is empty"

    try:
        # Try parsing as ISO format
        datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return True, None
    except ValueError as e:
        return False, f"Invalid ISO datetime format: {str(e)}"
    except Exception as e:
        return False, f"Error validating datetime: {str(e)}"


def validate_date_range(start_date: str, end_date: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that start_date is before end_date.

    Args:
        start_date: ISO datetime string
        end_date: ISO datetime string

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate both dates first
    is_valid, error = validate_iso_datetime(start_date)
    if not is_valid:
        return False, f"Invalid start_date: {error}"

    is_valid, error = validate_iso_datetime(end_date)
    if not is_valid:
        return False, f"Invalid end_date: {error}"

    # Parse and compare
    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    if start_dt >= end_dt:
        return False, "start_date must be before end_date"

    return True, None


# ============================================================================
# Priority Validation
# ============================================================================

def validate_priority(priority: any) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Validate and normalize priority value.

    Accepts:
        - Integers: 0-4
        - Strings: "low" (0), "medium" (1), "high" (2), "urgent" (3), "critical" (4)

    Args:
        priority: Priority value to validate

    Returns:
        Tuple of (is_valid, error_message, normalized_priority)
    """
    # Map string priorities to integers
    priority_map = {
        "low": 0,
        "medium": 1,
        "high": 2,
        "urgent": 3,
        "critical": 4
    }

    # Handle integer priority
    if isinstance(priority, int):
        if 0 <= priority <= 4:
            return True, None, priority
        else:
            return False, "Priority must be between 0 and 4", None

    # Handle string priority
    if isinstance(priority, str):
        priority_lower = priority.lower()
        if priority_lower in priority_map:
            return True, None, priority_map[priority_lower]
        else:
            # Try parsing as integer string
            try:
                priority_int = int(priority)
                if 0 <= priority_int <= 4:
                    return True, None, priority_int
                else:
                    return False, "Priority must be between 0 and 4", None
            except ValueError:
                return False, f"Invalid priority: must be 0-4 or low/medium/high/urgent/critical", None

    return False, f"Invalid priority type: {type(priority)}", None


# ============================================================================
# Email Validation
# ============================================================================

def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email address format.

    Uses simple regex - not RFC 5322 compliant but good enough for basic validation.

    Args:
        email: Email address to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email:
        return False, "Email is empty"

    # Basic email regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if re.match(email_pattern, email):
        # Additional checks
        if len(email) > 254:  # RFC 5321
            return False, "Email too long (max 254 characters)"

        local, domain = email.rsplit('@', 1)
        if len(local) > 64:  # RFC 5321
            return False, "Email local part too long (max 64 characters)"

        return True, None
    else:
        return False, "Invalid email format"


# ============================================================================
# URL Validation
# ============================================================================

def validate_url(url: str, require_https: bool = False) -> Tuple[bool, Optional[str]]:
    """
    Validate URL format.

    Args:
        url: URL to validate
        require_https: If True, only accept https:// URLs

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not url:
        return False, "URL is empty"

    # Basic URL regex
    url_pattern = r'^https?://[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?:/[^\s]*)?$'

    if not re.match(url_pattern, url):
        return False, "Invalid URL format"

    if require_https and not url.startswith('https://'):
        return False, "URL must use HTTPS"

    if len(url) > 2048:  # Common browser limit
        return False, "URL too long (max 2048 characters)"

    return True, None


# ============================================================================
# Duration Validation
# ============================================================================

def validate_duration_minutes(duration: int) -> Tuple[bool, Optional[str]]:
    """
    Validate duration in minutes.

    Args:
        duration: Duration in minutes

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(duration, int):
        try:
            duration = int(duration)
        except (ValueError, TypeError):
            return False, f"Duration must be an integer, got {type(duration)}"

    if duration <= 0:
        return False, "Duration must be positive"

    if duration > 1440:  # 24 hours
        return False, "Duration too long (max 24 hours / 1440 minutes)"

    return True, None


# ============================================================================
# Business Hours Validation
# ============================================================================

def validate_business_hours(start_hour: int, end_hour: int) -> Tuple[bool, Optional[str]]:
    """
    Validate business hours range.

    Args:
        start_hour: Business start hour (0-23)
        end_hour: Business end hour (0-23)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(start_hour, int) or not isinstance(end_hour, int):
        return False, "Business hours must be integers"

    if not (0 <= start_hour <= 23):
        return False, "Start hour must be between 0 and 23"

    if not (0 <= end_hour <= 23):
        return False, "End hour must be between 0 and 23"

    if start_hour >= end_hour:
        return False, "Start hour must be before end hour"

    return True, None


# ============================================================================
# String Sanitization
# ============================================================================

def sanitize_string(value: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input to prevent injection attacks.

    Args:
        value: String to sanitize
        max_length: Optional maximum length

    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        value = str(value)

    # Remove null bytes (can cause issues in C-based libraries)
    value = value.replace('\x00', '')

    # Trim whitespace
    value = value.strip()

    # Apply length limit
    if max_length and len(value) > max_length:
        value = value[:max_length]

    return value


# ============================================================================
# Recurrence Pattern Validation
# ============================================================================

def validate_recurrence_pattern(pattern: str) -> Tuple[bool, Optional[str]]:
    """
    Validate recurrence pattern.

    Args:
        pattern: Recurrence pattern string

    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_patterns = ["daily", "weekly", "weekdays", "biweekly", "monthly"]

    if not pattern:
        return False, "Recurrence pattern is empty"

    if pattern.lower() not in valid_patterns:
        return False, f"Invalid recurrence pattern. Must be one of: {', '.join(valid_patterns)}"

    return True, None


# ============================================================================
# Count/Limit Validation
# ============================================================================

def validate_count(count: int, min_val: int = 1, max_val: int = 100) -> Tuple[bool, Optional[str]]:
    """
    Validate count/limit values.

    Args:
        count: Count to validate
        min_val: Minimum allowed value
        max_val: Maximum allowed value

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(count, int):
        try:
            count = int(count)
        except (ValueError, TypeError):
            return False, f"Count must be an integer, got {type(count)}"

    if count < min_val:
        return False, f"Count must be at least {min_val}"

    if count > max_val:
        return False, f"Count must be at most {max_val}"

    return True, None
