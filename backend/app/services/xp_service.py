from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import XPTransaction


async def award_xp(
    session: AsyncSession,
    *,
    user_id: int,
    activity_type: str,
    amount: int,
    idempotency_key: str,
    reference_id: str | None = None,
    verification_status: str = "verified",
) -> XPTransaction:
    """Append one reward, returning the existing row for duplicate requests."""
    existing = await session.scalar(select(XPTransaction).where(XPTransaction.idempotency_key == idempotency_key))
    if existing:
        return existing
    transaction = XPTransaction(user_id=user_id, activity_type=activity_type, amount=amount, idempotency_key=idempotency_key, reference_id=reference_id, verification_status=verification_status)
    session.add(transaction)
    await session.flush()
    return transaction
