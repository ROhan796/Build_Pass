from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GenerateRequest(BaseModel):
    format: str = Field(..., pattern="^[AB]$", description="Format A or B")
    name: Optional[str] = Field(None, max_length=100)
    role: Optional[str] = Field(None, max_length=100)
    handle: Optional[str] = Field(None, max_length=50)
    theme: Optional[str] = Field(None, max_length=30)


class GenerateResponse(BaseModel):
    share_id: str
    image_url: str
    download_url: str
    name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    handle: Optional[str] = None
    theme: Optional[str] = None
    card_no: Optional[int] = None
    format: str


class StatsResponse(BaseModel):
    total_generations: int
    today: int
    format_a_pct: float
    format_b_pct: float


class AdminStatsResponse(BaseModel):
    total: int
    today: int
    downloads: int
    shares: int
    format_a: int
    format_b: int
    mobile_pct: float


class TimeseriesPoint(BaseModel):
    ts: str
    count: int


class TimeseriesResponse(BaseModel):
    data: list[TimeseriesPoint]


class GenerationRecord(BaseModel):
    id: str
    share_id: str
    format: str
    image_url: str
    name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    handle: Optional[str] = None
    theme: Optional[str] = None
    card_no: Optional[int] = None
    created_at: Optional[datetime] = None
    downloaded_at: Optional[datetime] = None
    shared_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedGenerations(BaseModel):
    items: list[GenerationRecord]
    total: int
    page: int
    page_size: int
    total_pages: int
