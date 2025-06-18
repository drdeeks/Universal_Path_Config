@echo off
REM Quick Rebuild Command - Batch File Wrapper
REM This provides a simple double-click rebuild option

REM Change to the directory where this batch file is located
cd /d "%~dp0"

REM Check if rebuild.ps1 exists
if not exist "rebuild.ps1" (
    echo ERROR: rebuild.ps1 not found in current directory!
    echo Current directory: %CD%
    echo.
    echo Please ensure you are running this batch file from the project root.
    pause
    exit /b 1
)

echo.
echo ================================
echo    Quick Rebuild Command
echo ================================
echo.

REM Check if PowerShell is available (try multiple methods)
where pwsh >nul 2>nul
if %errorlevel% equ 0 (
    echo Using PowerShell 7...
    pwsh -ExecutionPolicy Bypass -File ".\rebuild.ps1" %*
    goto :end
)

where powershell >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Windows PowerShell...
    powershell -ExecutionPolicy Bypass -File ".\rebuild.ps1" %*
    goto :end
)

REM Try common PowerShell paths directly
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    echo Using Windows PowerShell (System32)...
    "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File ".\rebuild.ps1" %*
    goto :end
)

if exist "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" (
    echo Using Windows PowerShell (SysWOW64)...
    "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" -ExecutionPolicy Bypass -File ".\rebuild.ps1" %*
    goto :end
)

REM Try PowerShell 7 common paths
if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" (
    echo Using PowerShell 7 (Program Files)...
    "%ProgramFiles%\PowerShell\7\pwsh.exe" -ExecutionPolicy Bypass -File ".\rebuild.ps1" %*
    goto :end
)

REM Final fallback - try direct call
echo Attempting direct PowerShell call...
powershell.exe -ExecutionPolicy Bypass -File ".\rebuild.ps1" %* 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: PowerShell not found or not accessible!
    echo.
    echo Troubleshooting steps:
    echo 1. Check if PowerShell is installed: Win+R, type "powershell", press Enter
    echo 2. Run Command Prompt as Administrator
    echo 3. Try running: .\rebuild.ps1 directly in PowerShell
    echo 4. Check system PATH environment variable
    echo.
    pause
    exit /b 1
)

:end
echo.
echo Press any key to exit...
pause >nul 