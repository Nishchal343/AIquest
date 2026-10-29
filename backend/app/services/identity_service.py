import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IdentityResult
from app.schemas.api import IdentityRequest


async def save_identity(session: AsyncSession, user_id: int, payload: IdentityRequest) -> IdentityResult:
    result = await session.scalar(select(IdentityResult).where(IdentityResult.user_id == user_id))
    values = dict(user_id=user_id, identity=payload.identity, rank=payload.rank, level=payload.level, avatar_choice=payload.avatar_choice, answer_payload=json.dumps(payload.answers))
    if result:
        for key, value in values.items():
            setattr(result, key, value)
    else:
        result = IdentityResult(**values)
        session.add(result)
    await session.flush()
    return result
