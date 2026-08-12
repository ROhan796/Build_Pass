from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.analytics import get_public_stats

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats")
async def stats(db: AsyncSession = Depends(get_db)):
    return await get_public_stats(db)
