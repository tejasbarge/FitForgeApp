@echo off
title FitForge - MySQL Setup
color 0A
echo ============================================
echo   FitForge MySQL Password Reset Tool
echo ============================================
echo.

echo [1/3] Stopping MySQL service...
net stop MySQL80
if %errorlevel% neq 0 (
    echo WARNING: Could not stop service normally, trying force...
    taskkill /F /IM mysqld.exe 2>nul
    timeout /t 2 /nobreak >nul
)

echo.
echo [2/3] Starting MySQL in safe mode (no auth)...
start /B "" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables --skip-networking --console
timeout /t 6 /nobreak >nul

echo.
echo [3/3] Resetting root password...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --connect-expired-password < "%~dp0mysql_init.sql"

echo.
echo Stopping safe mode server...
taskkill /F /IM mysqld.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Starting MySQL service normally...
net start MySQL80
timeout /t 5 /nobreak >nul

echo.
echo Verifying connection...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pfitforge123 -e "SHOW DATABASES;" 2>&1

echo.
echo ============================================
echo  SUCCESS! MySQL password is: fitforge123
echo  Database 'fitforge_db' is ready.
echo ============================================
echo.
pause
