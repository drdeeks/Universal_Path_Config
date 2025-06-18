@echo off
setlocal enabledelayedexpansion

echo =================================
echo Admin Privilege Test Script
echo =================================
echo.

echo Testing admin detection methods...
echo.

:: Method 1: whoami /groups
echo Method 1: whoami /groups
whoami /groups | find "S-1-5-32-544" >nul
if %errorLevel% == 0 (
    echo [✓] Admin detected via whoami
) else (
    echo [!] Not admin via whoami
)
echo.

:: Method 2: net session
echo Method 2: net session  
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Admin detected via net session
) else (
    echo [!] Not admin via net session
)
echo.

:: Method 3: fsutil (alternative test)
echo Method 3: fsutil
fsutil dirty query %systemdrive% >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Admin detected via fsutil
) else (
    echo [!] Not admin via fsutil
)
echo.

echo Current user: 
whoami
echo.

echo Current directory: %CD%
echo Script location: %~dp0
echo.

echo Node.js check:
where node >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Node.js found
    node --version
) else (
    echo [!] Node.js not found
)
echo.

echo npm check:
where npm >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] npm found
    npm --version
) else (
    echo [!] npm not found
)
echo.

echo Package.json check:
if exist "package.json" (
    echo [✓] package.json found
) else (
    echo [!] package.json not found
    echo Looking for it...
    dir package.json /s
)
echo.

echo Node modules check:
if exist "node_modules" (
    echo [✓] node_modules folder exists
    if exist "node_modules\electron" (
        echo [✓] Electron found in node_modules
    ) else (
        echo [!] Electron not found in node_modules
    )
) else (
    echo [!] node_modules folder missing
)
echo.

echo Scripts in package.json:
if exist "package.json" (
    findstr "start" package.json
)
echo.

pause
endlocal 