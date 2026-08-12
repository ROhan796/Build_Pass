import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY", "")
R2_BUCKET = os.getenv("R2_BUCKET", "")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "")
LOCAL_UPLOAD_DIR = os.getenv("LOCAL_UPLOAD_DIR", "./uploads")


def _ensure_upload_dir():
    Path(LOCAL_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


def upload_image(image_bytes: bytes, share_id: str) -> tuple[str, str]:
    _ensure_upload_dir()

    filename = f"{share_id}.png"
    filepath = Path(LOCAL_UPLOAD_DIR) / filename
    filepath.write_bytes(image_bytes)

    image_url = f"/uploads/{filename}"
    download_url = f"/uploads/{filename}"

    return image_url, download_url


def get_upload_path(share_id: str) -> str:
    return str(Path(LOCAL_UPLOAD_DIR) / f"{share_id}.png")
