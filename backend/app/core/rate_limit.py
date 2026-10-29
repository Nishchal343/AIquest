from collections import defaultdict, deque
from time import monotonic

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class InMemoryRateLimitMiddleware(BaseHTTPMiddleware):
    """A safe local default; use an edge/Redis limiter for multi-instance production."""

    def __init__(self, app, limit: int = 30, window_seconds: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/health", "/docs", "/openapi.json", "/redoc"}:
            return await call_next(request)
        key = request.client.host if request.client else "unknown"
        now = monotonic()
        bucket = self.requests[key]
        while bucket and bucket[0] <= now - self.window_seconds:
            bucket.popleft()
        if len(bucket) >= self.limit:
            return JSONResponse(status_code=429, content={"detail": "Too many requests. Try again shortly."})
        bucket.append(now)
        return await call_next(request)
