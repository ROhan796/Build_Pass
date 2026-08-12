import random
import nanoid
from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.image_processor import composite_frame_a, composite_card_b, generate_builder_title
from services.storage import upload_image
from services.analytics import create_generation
from schemas.generation import GenerateResponse

router = APIRouter(prefix="/api", tags=["generate"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"}
MAX_SIZE = 20 * 1024 * 1024


@router.post("/generate", response_model=GenerateResponse)
async def generate(
    request: Request,
    image: UploadFile = File(...),
    format: str = Form(...),
    name: str = Form(None),
    role: str = Form(None),
    handle: str = Form(None),
    theme: str = Form(None),
    db: AsyncSession = Depends(get_db),
):
    if format not in ("A", "B"):
        raise HTTPException(status_code=422, detail="Format must be 'A' or 'B'")

    if image.content_type and image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {image.content_type}")

    contents = await image.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 20MB.")

    if len(contents) == 0:
        raise HTTPException(status_code=422, detail="Empty file uploaded.")

    try:
        card_no = random.randint(1000, 9999)
        builder_title = generate_builder_title(role or "")
        share_id = nanoid.generate(size=12)

        if format == "A":
            image_bytes = composite_frame_a(contents)
        else:
            image_bytes = composite_card_b(
                user_photo_bytes=contents,
                name=name or "HH GOA BUILDER",
                role=role or "Hacker Extraordinaire",
                title=builder_title,
                handle=handle or "",
                theme_name=theme or "cyan_surf",
                card_no=card_no,
            )

        image_url, download_url = upload_image(image_bytes, share_id)

        user_agent = request.headers.get("user-agent", "")
        client_ip = request.client.host if request.client else ""

        gen = await create_generation(
            db,
            share_id=share_id,
            format=format,
            image_url=image_url,
            download_url=download_url,
            name=name,
            role=role,
            title=builder_title,
            handle=handle,
            theme=theme,
            card_no=card_no,
            user_agent=user_agent,
            ip=client_ip,
        )

        return GenerateResponse(
            share_id=share_id,
            image_url=image_url,
            download_url=download_url,
            name=name,
            role=role,
            title=builder_title,
            handle=handle,
            theme=theme,
            card_no=card_no,
            format=format,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
