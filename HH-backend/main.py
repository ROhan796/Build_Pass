import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from db.database import init_db
from routers import generate, share, stats, tracking, admin

load_dotenv()

UPLOAD_DIR = os.getenv("LOCAL_UPLOAD_DIR", "./uploads")
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="HH Goa 2026 — Frame & ID Card Generator API",
    description="Backend API for generating branded HH Goa 2026 graphics",
    version="1.0.0",
    lifespan=lifespan,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(share.router)
app.include_router(stats.router)
app.include_router(tracking.router)
app.include_router(admin.router)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
async def root():
    return {"status": "ok", "service": "HH Goa 2026 API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
