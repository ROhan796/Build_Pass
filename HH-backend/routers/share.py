from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.analytics import get_generation_by_share_id

router = APIRouter(tags=["share"])

_template_dir = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(_template_dir))


@router.get("/share/{share_id}", response_class=HTMLResponse)
async def share_page(
    request: Request,
    share_id: str,
    db: AsyncSession = Depends(get_db),
):
    gen = await get_generation_by_share_id(db, share_id)
    if not gen:
        raise HTTPException(status_code=404, detail="Card not found")

    image_url = gen.image_url
    if image_url.startswith("/uploads/"):
        base_url = str(request.base_url).rstrip("/")
        image_url = f"{base_url}{image_url}"

    return templates.TemplateResponse(
        request=request,
        name="share.html",
        context={
            "image_url": image_url,
            "share_id": share_id,
            "name": gen.name or "a builder",
        },
    )
