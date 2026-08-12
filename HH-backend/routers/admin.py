import os
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.analytics import (
    get_admin_stats,
    get_timeseries,
    get_paginated_generations,
)
from schemas.generation import (
    AdminStatsResponse,
    TimeseriesResponse,
    TimeseriesPoint,
    PaginatedGenerations,
    GenerationRecord,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")


async def verify_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Dev mode: accept Clerk secret key directly as admin token
    if CLERK_SECRET_KEY and token == CLERK_SECRET_KEY:
        return {"sub": "dev-admin", "email": ADMIN_EMAIL or "admin@buildpass.app"}

    # Production: verify via Clerk API and check email
    try:
        import httpx

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.clerk.com/v1/users/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0,
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Clerk token")
            user = resp.json()
            email = user.get("email_addresses", [{}])[0].get("email_address", "")

            # Check if this email is the admin
            if ADMIN_EMAIL and email != ADMIN_EMAIL:
                raise HTTPException(status_code=403, detail="Not admin — access denied")

            return {"sub": user["id"], "email": email}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token verification failed")


@router.get("/stats", response_model=AdminStatsResponse)
async def admin_stats(
    admin=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    return await get_admin_stats(db)


@router.get("/timeseries", response_model=TimeseriesResponse)
async def admin_timeseries(
    days: int = 7,
    granularity: str = "day",
    admin=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    data = await get_timeseries(db, days=days, granularity=granularity)
    return TimeseriesResponse(data=[TimeseriesPoint(**d) for d in data])


@router.get("/generations", response_model=PaginatedGenerations)
async def admin_generations(
    page: int = 1,
    page_size: int = 50,
    format: str = None,
    admin=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    items, total = await get_paginated_generations(db, page=page, page_size=page_size, fmt=format)
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedGenerations(
        items=[GenerationRecord.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/export/csv")
async def export_csv(
    admin=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    items, _ = await get_paginated_generations(db, page=1, page_size=10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "ShareID", "Format", "Name", "Role", "Title", "Handle", "CreatedAt", "DownloadedAt", "SharedAt"])
    for item in items:
        writer.writerow([
            item.id,
            item.share_id,
            item.format,
            item.name or "",
            item.role or "",
            item.title or "",
            item.handle or "",
            item.created_at.isoformat() if item.created_at else "",
            item.downloaded_at.isoformat() if item.downloaded_at else "",
            item.shared_at.isoformat() if item.shared_at else "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=buildpass_generations_{__import__('time').time():.0f}.csv"},
    )
