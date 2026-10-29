import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.models import XPTransaction
from app.services.xp_service import award_xp


@pytest.mark.asyncio
async def test_xp_award_is_idempotent():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        first = await award_xp(session, user_id=1, activity_type="test", amount=25, idempotency_key="test:1")
        await session.commit()
        second = await award_xp(session, user_id=1, activity_type="test", amount=25, idempotency_key="test:1")
        await session.commit()
        count = await session.scalar(select(func.count()).select_from(XPTransaction))
    await engine.dispose()
    assert first.id == second.id
    assert count == 1
