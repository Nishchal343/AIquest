from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep) -> User:
    user_id = decode_access_token(token)
    if not user_id or not user_id.isdigit():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    user = await session.scalar(select(User).where(User.id == int(user_id), User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is unavailable")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
