@echo off
setlocal enabledelayedexpansion
title Universal Path Config - Run as Administrator (Safe Mode)

echo Universal Development Environment Setup - SAFE MODE
echo ====================================================
echo This mode disables GPU sandbox to avoid cache permission issues
echo.

:: Check if running as administrator using a more reliable method
whoami /groups | find "S-1-5-32-544" >nul
if %errorLevel% == 0 (
    echo [✓] Running with Administrator privileges
    echo.
    goto :run_app
) else (
    echo [!] Administrator privileges required
    echo.
    echo This app needs Administrator privileges to:
    echo  - Install development tools (Git, Node.js, VS Code, Docker, etc.)
    echo  - Configure PowerShell profiles
    echo  - Set up WSL2 and Ubuntu
    echo  - Modify system PATH variables
    echo.
    echo Requesting elevation...
    echo Please click "Yes" when Windows asks for permission.
    echo.

    :: Use a more reliable elevation method
    powershell -WindowStyle Hidden -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b 0
)

:run_app
:: Navigate to the script directory
pushd "%~dp0"

echo [✓] Current directory: %CD%
echo.

:: Session Management Options
echo [i] Session Management Options:
echo  Press Ctrl+C to stop this session
echo  Run 'stop-all-sessions.bat' to end all sessions
echo.

:: Check if Node.js is available
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Node.js not found in PATH
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo Then restart this script.
    echo.
    pause
    exit /b 1
)

:: Check if npm is available
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] npm not found in PATH
    echo Please ensure Node.js is properly installed.
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js and npm found
echo.

:: Check and install dependencies
if not exist "node_modules\electron" (
    echo [→] Installing dependencies...
    echo This may take a few minutes on first run...
    echo.
    
    call npm install
    
    if !errorLevel! neq 0 (
        echo.
        echo [!] Failed to install dependencies
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    
    echo [✓] Dependencies installed successfully
    echo.
)

:: Start the application in safe mode
echo [→] Starting Universal Development Environment Setup (SAFE MODE)...
echo.
echo SAFE MODE features:
echo  - Disables GPU sandbox (--disable-gpu-sandbox)
echo  - Disables security sandbox (--no-sandbox)
echo  - Bypasses common cache permission issues
echo.
echo If the app doesn't appear, check for any error messages below.
echo You can close this window once the app opens successfully.
echo.

:: Launch the app in a detached process so terminal can be closed
start "Universal Path Config (Safe Mode)" npm run start-safe

:: Give the app a moment to start
timeout /t 3 /nobreak >nul

echo [✓] Application launched successfully in Safe Mode!
echo [i] You can now safely close this terminal window.
echo [i] The Universal Path Config app is running independently.
echo.
echo Press any key to close this terminal...
pause >nul

:: Clean exit - don't wait for the app to close
goto :eof

popd
endlocal 