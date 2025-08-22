@echo off
echo 🌾 Starting KrishiGPT...
echo.

echo Starting Backend (FastAPI)...
start "KrishiGPT Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend (Next.js)...
start "KrishiGPT Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo 🚀 KrishiGPT is starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
