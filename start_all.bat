@echo off
echo ========================================================
echo   Starting FitTrack AI Fitness & Performance Platform
echo ========================================================
echo.
echo [1/2] Starting FitTrack Backend API Server on Port 5000...
start "FitTrack Server" cmd /k "cd server && npm run dev"
timeout /t 3 >nul

echo [2/2] Starting FitTrack Frontend Client on Port 5173...
start "FitTrack Client" cmd /k "cd client && npm run dev"

echo.
echo Both services launched! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo.
