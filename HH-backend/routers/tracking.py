from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.analytics import update_download, update_share

router = APIRouter(prefix="/api", tags=["tracking"])


@router.post("/track/{share_id}/download")
async def track_download(share_id: str, db: AsyncSession = Depends(get_db)):
    await update_download(db, share_id)
    return {"ok": True}


@router.post("/track/{share_id}/share")
async def track_share(share_id: str, db: AsyncSession = Depends(get_db)):
    await update_share(db, share_id)
    return {"ok": True}
