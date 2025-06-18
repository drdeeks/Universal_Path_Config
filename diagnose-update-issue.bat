@echo off
echo Universal Dev Setup - Update Diagnostics
echo =======================================
echo.

REM Check admin status
echo 1. Checking Administrator Status...
net session >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ NOT running as Administrator
    echo   Please right-click and select "Run as Administrator"
)
echo.

REM Check current directory
echo 2. Current Directory...
echo Current location: "%CD%"
echo.

REM Check if dist folder exists
echo 3. Checking dist folder...
if exist "dist\" (
    echo ✅ dist folder exists
    echo Contents of dist folder:
    dir "dist\" /b
) else (
    echo ❌ dist folder NOT found
    echo Please run 'npm run build:portable' first
)
echo.

REM Check for source executable
echo 4. Checking source executable...
if exist "dist\Universal Dev Setup 1.2.0 Portable.exe" (
    echo ✅ Source executable found in dist folder
    for %%A in ("dist\Universal Dev Setup 1.2.0 Portable.exe") do echo   Size: %%~zA bytes
    for %%A in ("dist\Universal Dev Setup 1.2.0 Portable.exe") do echo   Date: %%~tA
) else (
    echo ❌ Source executable NOT found in dist folder
    echo Expected location: "%CD%\dist\Universal Dev Setup 1.2.0 Portable.exe"
)
echo.

REM Check for current executable
echo 5. Checking current executable...
if exist "Universal Dev Setup 1.2.0 Portable.exe" (
    echo ✅ Current v1.2.0 executable exists
    for %%A in ("Universal Dev Setup 1.2.0 Portable.exe") do echo   Size: %%~zA bytes
    for %%A in ("Universal Dev Setup 1.2.0 Portable.exe") do echo   Date: %%~tA
) else if exist "Universal Dev Setup 1.0.0 Portable.exe" (
    echo ⚠️ Old v1.0.0 executable exists (needs update)
    for %%A in ("Universal Dev Setup 1.0.0 Portable.exe") do echo   Size: %%~zA bytes
    for %%A in ("Universal Dev Setup 1.0.0 Portable.exe") do echo   Date: %%~tA
) else (
    echo ❌ No current executable found
    echo Expected location: "%CD%\Universal Dev Setup 1.2.0 Portable.exe"
)
echo.

REM Check for running processes
echo 6. Checking for running processes...
tasklist /fi "imagename eq Universal Dev Setup 1.2.0 Portable.exe" 2>nul | find /i "Universal Dev Setup 1.2.0 Portable.exe" >nul
if %errorLevel% equ 0 (
    echo ⚠️ v1.2.0 Process is currently running
    echo Running processes:
    tasklist /fi "imagename eq Universal Dev Setup 1.2.0 Portable.exe"
) else (
    tasklist /fi "imagename eq Universal Dev Setup 1.0.0 Portable.exe" 2>nul | find /i "Universal Dev Setup 1.0.0 Portable.exe" >nul
    if %errorLevel% equ 0 (
        echo ⚠️ v1.0.0 Process is currently running
        echo Running processes:
        tasklist /fi "imagename eq Universal Dev Setup 1.0.0 Portable.exe"
    ) else (
        echo ✅ No running processes found
    )
)
echo.

REM Check disk space
echo 7. Checking disk space...
for /f "tokens=3" %%a in ('dir "%CD%" ^| find "bytes free"') do echo Available space: %%a bytes
echo.

REM Check file permissions (basic test)
echo 8. Testing file permissions...
echo Test > test_permission_file.txt 2>nul
if exist test_permission_file.txt (
    echo ✅ Can create files in current directory
    del test_permission_file.txt >nul 2>&1
) else (
    echo ❌ Cannot create files in current directory (permission issue)
)
echo.

echo 9. Summary and Recommendations...
echo ========================================
if exist "dist\Universal Dev Setup 1.2.0 Portable.exe" (
    echo ✅ Source file exists - update should work
    echo If update still fails, try:
    echo 1. Ensure no antivirus is blocking the operation
    echo 2. Close all instances of the application
    echo 3. Run the update script as Administrator
    echo 4. Restart your computer and try again
    echo.
    echo Alternative: Use COMPREHENSIVE-REBUILD-SCRIPT.bat for complete rebuild
) else (
    echo ❌ Source file missing - need to build first
    echo Options:
    echo 1. Run: npm run build:portable
    echo 2. Run: COMPREHENSIVE-REBUILD-SCRIPT.bat (recommended)
)
echo.

pause 