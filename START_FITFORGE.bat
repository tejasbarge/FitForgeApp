@echo off
title FitForge App Launcher
color 0B
echo ============================================
echo        FitForge - Starting Application
echo ============================================
echo.

REM Check MySQL
echo [1/3] Checking MySQL...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pfitforge123 -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL not accessible with password 'fitforge123'
    echo Please run reset_mysql.bat as Administrator first!
    pause
    exit /b 1
)
echo  MySQL OK

REM Start Backend
echo.
echo [2/3] Starting Spring Boot Backend...
start "FitForge Backend" cmd /k "cd /d "%~dp0fitforge-backend" && mvn spring-boot:run"

echo  Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak >nul

REM Start Frontend
echo.
echo [3/3] Starting React Frontend...
if not exist "%~dp0fitforge-frontend\node_modules" (
    echo Installing frontend dependencies...
    pushd "%~dp0fitforge-frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Frontend dependency installation failed.
        pause
        exit /b 1
    )
    popd
)
start "FitForge Frontend" cmd /k "cd /d "%~dp0fitforge-frontend" && npm run dev"

echo.
echo ============================================
echo  FitForge is starting!
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173
echo ============================================
echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak >nul
start http://localhost:5173

pause
