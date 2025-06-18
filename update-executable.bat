@echo off
echo Updating Universal Dev Setup Portable Executable...
echo.

REM Check if we're running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator.
    echo Please right-click and select "Run as Administrator"
    pause
    exit /b 1
)

REM Check if dist folder exists
echo Checking for dist folder...
if not exist "dist\" (
    echo ERROR: dist folder not found.
    echo Please run 'npm run build:portable' first to create the executable.
    pause
    exit /b 1
)

REM Check if new executable exists in dist folder
echo Checking for new executable in dist folder...
if not exist "dist\Universal Dev Setup 1.2.0 Portable.exe" (
    echo ERROR: New executable not found in dist folder.
    echo File should be at: "%CD%\dist\Universal Dev Setup 1.2.0 Portable.exe"
    echo.
    echo Available files in dist folder:
    dir "dist\" /b
    echo.
    echo Please run 'npm run build:portable' first.
    pause
    exit /b 1
)

REM Stop any running instances
echo Stopping any running instances...
taskkill /f /im "Universal Dev Setup 1.2.0 Portable.exe" 2>nul
taskkill /f /im "Universal Dev Setup 1.0.0 Portable.exe" 2>nul
taskkill /f /im "Universal Dev Setup.exe" 2>nul
timeout /t 3 /nobreak >nul

REM Remove old executable if it exists
echo Removing old executable...
if exist "Universal Dev Setup 1.2.0 Portable.exe" (
    echo Found existing executable, removing it...
    del /f "Universal Dev Setup 1.2.0 Portable.exe"
)
if exist "Universal Dev Setup 1.0.0 Portable.exe" (
    echo Found old v1.0.0 executable, removing it...
    del /f "Universal Dev Setup 1.0.0 Portable.exe"
    if errorlevel 1 (
        echo ERROR: Could not remove old executable.
        echo Please ensure the application is completely closed and try again.
        echo If the file is locked, restart your computer and try again.
        pause
        exit /b 1
    )
    echo Old executable removed successfully.
) else (
    echo No existing executable found to remove.
)

REM Copy new executable
echo Copying updated executable...
echo Source: "%CD%\dist\Universal Dev Setup 1.2.0 Portable.exe"
echo Target: "%CD%\Universal Dev Setup 1.2.0 Portable.exe"

copy "dist\Universal Dev Setup 1.2.0 Portable.exe" "." >nul
if errorlevel 1 (
    echo ERROR: Could not copy new executable.
    echo This could be due to:
    echo - Insufficient permissions
    echo - Antivirus blocking the operation
    echo - Disk space issues
    echo.
    echo Please try:
    echo 1. Run as Administrator (if not already)
    echo 2. Temporarily disable antivirus
    echo 3. Check available disk space
    pause
    exit /b 1
)

REM Verify the copy was successful
if exist "Universal Dev Setup 1.2.0 Portable.exe" (
    echo SUCCESS: Executable updated successfully!
    echo.
    echo File size verification:
    for %%A in ("Universal Dev Setup 1.2.0 Portable.exe") do echo New executable size: %%~zA bytes
    for %%A in ("dist\Universal Dev Setup 1.2.0 Portable.exe") do echo Source executable size: %%~zA bytes
) else (
    echo ERROR: Copy operation appeared to succeed but file is not present.
    echo This may indicate a filesystem or permissions issue.
    pause
    exit /b 1
)

echo.
echo Update complete! You can now run the updated executable.
echo File location: "%CD%\Universal Dev Setup 1.2.0 Portable.exe"
pause 