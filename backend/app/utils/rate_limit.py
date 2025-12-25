"""
Rate Limiting Utilities
Simple in-memory rate limiter for API protection.
For production, use Redis-based solution.
"""

import time
from collections import defaultdict
from typing import Dict, Tuple, Optional
from functools import wraps
from fastapi import HTTPException, Request
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Simple sliding window rate limiter.
    Tracks requests per key (IP or user ID) within a time window.
    """
    
    def __init__(self):
        # Structure: {key: [(timestamp, count), ...]}
        self._requests: Dict[str, list] = defaultdict(list)
        self._cleanup_interval = 60  # seconds
        self._last_cleanup = time.time()
    
    def _cleanup_old_entries(self, window_seconds: int):
        """Remove entries older than the window"""
        current_time = time.time()
        
        # Only cleanup periodically
        if current_time - self._last_cleanup < self._cleanup_interval:
            return
        
        self._last_cleanup = current_time
        cutoff = current_time - window_seconds
        
        keys_to_remove = []
        for key, timestamps in self._requests.items():
            # Filter out old timestamps
            self._requests[key] = [ts for ts in timestamps if ts > cutoff]
            if not self._requests[key]:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self._requests[key]
    
    def is_allowed(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Check if request is allowed under rate limit.
        
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time_seconds)
        """
        current_time = time.time()
        cutoff = current_time - window_seconds
        
        # Cleanup old entries periodically
        self._cleanup_old_entries(window_seconds)
        
        # Get recent requests for this key
        recent = [ts for ts in self._requests[key] if ts > cutoff]
        self._requests[key] = recent
        
        # Calculate remaining
        current_count = len(recent)
        remaining = max(0, max_requests - current_count)
        
        # Calculate reset time
        if recent:
            oldest = min(recent)
            reset_time = int(oldest + window_seconds - current_time)
        else:
            reset_time = window_seconds
        
        if current_count >= max_requests:
            return False, 0, reset_time
        
        # Record this request
        self._requests[key].append(current_time)
        
        return True, remaining - 1, reset_time
    
    def get_key_from_request(self, request: Request, use_user_id: bool = False) -> str:
        """Extract rate limit key from request"""
        # Try to get user ID from headers or body
        if use_user_id:
            user_id = request.headers.get("X-User-ID")
            if user_id:
                return f"user:{user_id}"
        
        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"
        
        return f"ip:{ip}"


# Global rate limiter instance
_rate_limiter = RateLimiter()


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter instance"""
    return _rate_limiter


# Rate limit configurations
RATE_LIMITS = {
    "default": {"max_requests": 100, "window_seconds": 60},
    "chat": {"max_requests": 30, "window_seconds": 60},
    "ai_query": {"max_requests": 20, "window_seconds": 60},
    "admin": {"max_requests": 50, "window_seconds": 60},
    "auth": {"max_requests": 10, "window_seconds": 60},
}


def check_rate_limit(
    request: Request,
    limit_type: str = "default",
    use_user_id: bool = False
) -> None:
    """
    Check rate limit and raise HTTPException if exceeded.
    
    Args:
        request: FastAPI request object
        limit_type: Type of rate limit to apply
        use_user_id: Whether to use user ID instead of IP
    
    Raises:
        HTTPException: 429 Too Many Requests if limit exceeded
    """
    limiter = get_rate_limiter()
    config = RATE_LIMITS.get(limit_type, RATE_LIMITS["default"])
    
    key = limiter.get_key_from_request(request, use_user_id)
    is_allowed, remaining, reset_time = limiter.is_allowed(
        key,
        config["max_requests"],
        config["window_seconds"]
    )
    
    if not is_allowed:
        logger.warning(f"Rate limit exceeded for {key}")
        raise HTTPException(
            status_code=429,
            detail={
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests. Please try again later.",
                "retry_after": reset_time
            },
            headers={
                "Retry-After": str(reset_time),
                "X-RateLimit-Limit": str(config["max_requests"]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time)
            }
        )


def rate_limit(limit_type: str = "default", use_user_id: bool = False):
    """
    Decorator for rate limiting endpoints.
    
    Usage:
        @router.post("/chat")
        @rate_limit("chat")
        async def chat_endpoint(request: Request, ...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find the Request object in args or kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                request = kwargs.get("request")
            
            if request:
                check_rate_limit(request, limit_type, use_user_id)
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
