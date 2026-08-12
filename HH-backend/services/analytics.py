import os
import uuid
import hashlib
from datetime import datetime, timezone
from sqlalchemy import select, func, case, text
from sqlalchemy.ext.asyncio import AsyncSession
from models.generation import Generation


async def create_generation(
    db: AsyncSession,
    *,
    share_id: str,
    format: str,
    image_url: str,
    download_url: str,
    name: str | None = None,
    role: str | None = None,
    title: str | None = None,
    handle: str | None = None,
    theme: str | None = None,
    card_no: int | None = None,
    user_agent: str | None = None,
    ip: str | None = None,
) -> Generation:
    ip_hash = hashlib.sha256(ip.encode()).hexdigest() if ip else None
    gen = Generation(
        share_id=share_id,
        format=format,
        image_url=image_url,
        download_url=download_url,
        name=name,
        role=role,
        title=title,
        handle=handle,
        theme=theme,
        card_no=card_no,
        user_agent=user_agent,
        ip_hash=ip_hash,
    )
    db.add(gen)
    await db.commit()
    await db.refresh(gen)
    return gen


async def get_generation_by_share_id(db: AsyncSession, share_id: str) -> Generation | None:
    result = await db.execute(select(Generation).where(Generation.share_id == share_id))
    return result.scalar_one_or_none()


async def update_download(db: AsyncSession, share_id: str):
    result = await db.execute(select(Generation).where(Generation.share_id == share_id))
    gen = result.scalar_one_or_none()
    if gen:
        gen.downloaded_at = datetime.now(timezone.utc)
        await db.commit()


async def update_share(db: AsyncSession, share_id: str):
    result = await db.execute(select(Generation).where(Generation.share_id == share_id))
    gen = result.scalar_one_or_none()
    if gen:
        gen.shared_at = datetime.now(timezone.utc)
        await db.commit()


async def get_public_stats(db: AsyncSession) -> dict:
    total = (await db.execute(select(func.count(Generation.id)))).scalar() or 0

    from datetime import timedelta
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.created_at >= today_start)
        )
    ).scalar() or 0

    fmt_a = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.format == "A")
        )
    ).scalar() or 0

    fmt_b = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.format == "B")
        )
    ).scalar() or 0

    a_pct = round(fmt_a / max(total, 1) * 100, 1)
    b_pct = round(fmt_b / max(total, 1) * 100, 1)

    return {
        "total_generations": total,
        "today": today,
        "format_a_pct": a_pct,
        "format_b_pct": b_pct,
    }


async def get_admin_stats(db: AsyncSession) -> dict:
    total = (await db.execute(select(func.count(Generation.id)))).scalar() or 0

    from datetime import timedelta
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.created_at >= today_start)
        )
    ).scalar() or 0

    downloads = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.downloaded_at.isnot(None))
        )
    ).scalar() or 0

    shares = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.shared_at.isnot(None))
        )
    ).scalar() or 0

    fmt_a = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.format == "A")
        )
    ).scalar() or 0

    fmt_b = (
        await db.execute(
            select(func.count(Generation.id)).where(Generation.format == "B")
        )
    ).scalar() or 0

    mobile = (
        await db.execute(
            select(func.count(Generation.id)).where(
                Generation.user_agent.ilike("%mobile%")
            )
        )
    ).scalar() or 0

    return {
        "total": total,
        "today": today,
        "downloads": downloads,
        "shares": shares,
        "format_a": fmt_a,
        "format_b": fmt_b,
        "mobile_pct": round(mobile / max(total, 1) * 100, 1),
    }


async def get_timeseries(db: AsyncSession, days: int = 7, granularity: str = "day") -> list[dict]:
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    results = []
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            await db.execute(
                select(func.count(Generation.id)).where(
                    Generation.created_at >= day_start,
                    Generation.created_at < day_end,
                )
            )
        ).scalar() or 0
        results.append({
            "ts": day_start.isoformat(),
            "count": count,
        })
    return results


async def get_paginated_generations(
    db: AsyncSession, page: int = 1, page_size: int = 50, fmt: str | None = None
) -> tuple[list[Generation], int]:
    query = select(Generation).order_by(Generation.created_at.desc())
    count_query = select(func.count(Generation.id))

    if fmt:
        query = query.where(Generation.format == fmt)
        count_query = count_query.where(Generation.format == fmt)

    total = (await db.execute(count_query)).scalar() or 0
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    items = list(result.scalars().all())
    return items, total
