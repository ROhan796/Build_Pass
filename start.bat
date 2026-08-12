@echo off
title HH Goa 2026 - Full Stack Portal
echo.
echo ====================================
echo   HH GOA 2026 - PORTAL STARTER
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

echo [1/4] Installing backend dependencies...
cd /d "%~dp0HH-backend"
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [WARN] Some backend packages may need manual install
)

echo [2/4] Installing frontend dependencies...
cd /d "%~dp0HH-frontend"
if not exist node_modules (
    npm install
) else (
    echo       node_modules exists, skipping...
)

echo [3/4] Starting backend on http://localhost:8000 ...
cd /d "%~dp0HH-backend"
start "HH-Backend" cmd /c "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [4/4] Starting frontend on http://localhost:3000 ...
cd /d "%~dp0HH-frontend"
start "HH-Frontend" cmd /c "npm run dev"

echo.
echo ====================================
echo   ALL SERVICES STARTED!
echo ====================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo   Press any key to stop all services...
echo ====================================
pause >nul

:: Kill processes
taskkill /FI "WindowTitle eq HH-Backend" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq HH-Frontend" /T /F >nul 2>&1
echo Services stopped.
