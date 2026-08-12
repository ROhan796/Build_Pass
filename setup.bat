@echo off
title HH Goa 2026 - Initial Setup
echo.
echo ====================================
echo   HH GOA 2026 - ONE-TIME SETUP
echo ====================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Installing backend Python packages...
cd /d "%~dp0HH-backend"
pip install -r requirements.txt
echo       Done!
echo.

echo [2/5] Installing frontend Node packages...
cd /d "%~dp0HH-frontend"
call npm install
echo       Done!
echo.

echo [3/5] Creating backend .env...
if not exist ".env" (
    copy .env.example .env
    echo       Created .env from template - please edit with your keys!
) else (
    echo       .env already exists, skipping...
)
echo.

echo [4/5] Creating uploads directory...
if not exist "HH-backend\uploads" mkdir "HH-backend\uploads"
echo       Done!
echo.

echo [5/5] Initializing database...
cd /d "%~dp0HH-backend"
python -c "import asyncio; from db.database import init_db; asyncio.run(init_db()); print('Database tables created!')"
echo.

echo ====================================
echo   SETUP COMPLETE!
echo ====================================
echo.
echo   Next steps:
echo   1. Edit HH-backend\.env with your NeonDB + Clerk keys
echo   2. Edit HH-frontend\.env with your Clerk publishable key
echo   3. Run: start.bat
echo.
echo ====================================
pause
