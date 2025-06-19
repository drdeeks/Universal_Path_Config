@echo off
setlocal EnableDelayedExpansion

echo.
echo ====================================================
echo    Universal Path Config v1.2.0 - Comprehensive Rebuild
echo ====================================================
echo.

REM Check if we're running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator.
    echo Please right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo [INFO] Starting comprehensive rebuild process...
echo.

REM 1. Stop any running instances
echo [STEP 1/8] Stopping any running instances...
taskkill /f /im "Universal Dev Setup*.exe" 2>nul
taskkill /f /im "electron.exe" 2>nul
timeout /t 2 /nobreak >nul
echo [OK] Processes stopped

REM 2. Clean old build artifacts
echo.
echo [STEP 2/8] Cleaning old build artifacts...
if exist "dist\" (
    rmdir /s /q "dist\" 2>nul
    echo [OK] Removed old dist folder
) else (
    echo [INFO] No dist folder to remove
)

REM Clean old executables in root
for %%f in ("Universal Dev Setup*.exe") do (
    if exist "%%f" (
        del /f "%%f" 2>nul
        echo [OK] Removed old executable: %%f
    )
)

REM 3. Update dependencies
echo.
echo [STEP 3/8] Installing/updating dependencies...
if exist "node_modules\" (
    echo [INFO] Removing old node_modules...
    rmdir /s /q "node_modules\" 2>nul
)

echo [INFO] Installing fresh dependencies...
npm install --loglevel=error
if %errorLevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM 4. Build new portable executable
echo.
echo [STEP 4/8] Building new portable executable...
npm run build:portable
if %errorLevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [OK] Build completed

REM 5. Verify build output
echo.
echo [STEP 5/8] Verifying build output...
if exist "dist\Universal Dev Setup 1.2.0 Portable.exe" (
    echo [OK] New executable created successfully
    for %%A in ("dist\Universal Dev Setup 1.2.0 Portable.exe") do echo [INFO] Size: %%~zA bytes
) else (
    echo [ERROR] New executable not found in dist folder
    pause
    exit /b 1
)

REM 6. Copy executable to root for easy access
echo.
echo [STEP 6/8] Copying executable to root directory...
copy "dist\Universal Dev Setup 1.2.0 Portable.exe" "." >nul
if %errorLevel% neq 0 (
    echo [ERROR] Failed to copy executable to root
    pause
    exit /b 1
)
echo [OK] Executable copied to root directory

REM 7. Clean up unnecessary files
echo.
echo [STEP 7/8] Cleaning up unnecessary build artifacts...
if exist "dist\builder-debug.yml" del /f "dist\builder-debug.yml" 2>nul
if exist "dist\builder-effective-config.yaml" del /f "dist\builder-effective-config.yaml" 2>nul
if exist "dist\win-unpacked\" rmdir /s /q "dist\win-unpacked\" 2>nul
echo [OK] Build artifacts cleaned

REM 8. Final verification
echo.
echo [STEP 8/8] Final verification...
echo.

echo Build Summary:
echo ==============
if exist "Universal Dev Setup 1.2.0 Portable.exe" (
    echo ✅ Portable Executable: Universal Dev Setup 1.2.0 Portable.exe
    for %%A in ("Universal Dev Setup 1.2.0 Portable.exe") do (
        set /a size_mb=%%~zA/1024/1024
        echo    Size: !size_mb! MB
    )
) else (
    echo ❌ Portable executable missing
)

if exist "dist\Universal Dev Setup 1.2.0 Portable.exe" (
    echo ✅ Dist folder: Contains portable executable
) else (
    echo ❌ Dist folder: Missing executable
)

echo.
echo Features included in this build:
echo ✅ Enhanced Python detection (python, python3, py commands)
echo ✅ Robust path configuration with fallback mechanisms
echo ✅ Comprehensive cleanup system with duplicate detection
echo ✅ Professional session management
echo ✅ Color-coded admin privilege display
echo ✅ WSL integration with UTF-16 encoding fixes
echo ✅ Safe update system
echo ✅ Diagnostic tools

echo.
echo ====================================================
echo    ✅ Comprehensive Rebuild Complete!
echo ====================================================
echo.
echo Ready to use:
echo • Run: "Universal Dev Setup 1.2.0 Portable.exe" (as Administrator)
echo • Update: Use "update-executable.bat" for future updates
echo • Diagnose: Use "diagnose-update-issue.bat" for troubleshooting
echo • Sessions: Use "stop-all-sessions.bat" for clean shutdown
echo.

pause 