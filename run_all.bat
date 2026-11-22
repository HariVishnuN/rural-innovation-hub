@echo off
echo ====================================================
echo Launching Rural Innovation Hub (Backend + Frontend)
echo ====================================================
start "Rural Innovation Hub - Backend" "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "Rural Innovation Hub - Frontend" "%~dp0run_frontend.bat"
echo.
echo Both servers are launching!
echo Backend:  http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
echo Frontend: http://localhost:5173
echo.
