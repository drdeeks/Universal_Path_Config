@echo off
setlocal enabledelayedexpansion
title EMERGENCY SESSION KILLER - Universal Dev Setup

:: Emergency failsafe - No prompts, immediate termination
echo EMERGENCY SESSION KILLER - Universal Dev Setup
echo =============================================
echo [!] EMERGENCY TERMINATION IN PROGRESS...
echo.

:: Force kill all Electron processes (nuclear option)
taskkill /f /im electron.exe >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Force terminated all Electron processes
) else (
    echo [i] No Electron processes found
)

:: Force kill all Node.js processes (be careful - this kills ALL node processes)
echo [!] WARNING: Killing ALL Node.js processes on system...
taskkill /f /im node.exe >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Force terminated all Node.js processes
) else (
    echo [i] No Node.js processes found
)

:: Force kill npm processes
taskkill /f /im npm.cmd >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Force terminated all npm processes
) else (
    echo [i] No npm processes found
)

:: Force kill any cmd processes with our batch file names
for /f "tokens=2" %%a in ('tasklist /fo csv /fi "imagename eq cmd.exe" 2^>nul ^| find "cmd.exe"') do (
    taskkill /f /pid %%~a >nul 2>&1
)
echo [✓] Force terminated CMD processes

:: Kill PowerShell processes that might be related
taskkill /f /fi "WINDOWTITLE eq *Universal Dev Setup*" >nul 2>&1
echo [✓] Force terminated related PowerShell processes

echo.
echo [✓] EMERGENCY TERMINATION COMPLETE
echo [!] All related processes have been forcefully terminated
echo.
echo [i] If you continue to experience issues:
echo    1. Restart your computer
echo    2. Check Windows Task Manager for any remaining processes
echo    3. Clear application cache directories
echo.

timeout /t 3 /nobreak >nul
echo Closing in 3 seconds...
timeout /t 1 /nobreak >nul
echo Closing in 2 seconds...
timeout /t 1 /nobreak >nul
echo Closing in 1 second...
timeout /t 1 /nobreak >nul

endlocal 