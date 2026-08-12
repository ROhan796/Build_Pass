import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./local.db")

# Auto-convert postgresql:// to postgresql+asyncpg:// for NeonDB compatibility
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Fix sslmode=require to ssl=require for asyncpg
if "sslmode=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

is_postgres = "postgresql" in DATABASE_URL

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    **({"pool_size": 5, "max_overflow": 10} if is_postgres else {}),
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
