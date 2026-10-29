from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, auth, student
from app.core.config import get_settings
from app.core.rate_limit import InMemoryRateLimitMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Schema changes are deliberately handled by Alembic, never on startup.
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(InMemoryRateLimitMiddleware, limit=settings.rate_limit_per_minute)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT"], allow_headers=["Authorization", "Content-Type", "X-Admin-Key"])
app.include_router(admin.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(student.router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-quest-api"}
