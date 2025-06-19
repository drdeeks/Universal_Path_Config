@echo off
setlocal enabledelayedexpansion
title Universal Path Config - Session Manager (STOP ALL)

echo Universal Development Environment Setup - Session Manager
echo ==========================================================
echo [!] STOP ALL SESSIONS - Emergency Session Termination
echo.

echo [→] Searching for running Universal Path Config sessions...
echo.

:: Initialize counters
set /a electron_count=0
set /a node_count=0
set /a npm_count=0
set /a total_killed=0

:: Kill Electron processes running our app
echo [→] Terminating Electron instances...
for /f "tokens=2 delims=," %%a in ('tasklist /fo csv /fi "imagename eq electron.exe" 2^>nul ^| find "electron.exe"') do (
    set /a electron_count+=1
    echo    Killing Electron PID: %%~a
    taskkill /f /pid %%~a >nul 2>&1
    if !errorLevel! == 0 (
        set /a total_killed+=1
        echo    [✓] Successfully terminated Electron PID: %%~a
    ) else (
        echo    [!] Failed to terminate Electron PID: %%~a
    )
)

:: Kill Node.js processes that might be running our app
echo [→] Terminating Node.js instances running our app...
for /f "tokens=2,9 delims=," %%a in ('tasklist /fo csv /fi "imagename eq node.exe" 2^>nul ^| find "node.exe"') do (
    echo %%b | find "Universal-Path-Config" >nul
    if !errorLevel! == 0 (
        set /a node_count+=1
        echo    Killing Node.js PID: %%~a (%%b)
        taskkill /f /pid %%~a >nul 2>&1
        if !errorLevel! == 0 (
            set /a total_killed+=1
            echo    [✓] Successfully terminated Node.js PID: %%~a
        ) else (
            echo    [!] Failed to terminate Node.js PID: %%~a
        )
    )
)

:: Kill npm processes
echo [→] Terminating npm instances...
for /f "tokens=2 delims=," %%a in ('tasklist /fo csv /fi "imagename eq npm.cmd" 2^>nul ^| find "npm.cmd"') do (
    set /a npm_count+=1
    echo    Killing npm PID: %%~a
    taskkill /f /pid %%~a >nul 2>&1
    if !errorLevel! == 0 (
        set /a total_killed+=1
        echo    [✓] Successfully terminated npm PID: %%~a
    ) else (
        echo    [!] Failed to terminate npm PID: %%~a
    )
)

:: Kill any remaining cmd/powershell processes running our batch files
echo [→] Terminating batch file instances...
for /f "tokens=2,9 delims=," %%a in ('tasklist /fo csv /fi "imagename eq cmd.exe" 2^>nul ^| find "cmd.exe"') do (
    echo %%b | find "run-as-admin" >nul
    if !errorLevel! == 0 (
        echo    Killing CMD PID: %%~a (%%b)
        taskkill /f /pid %%~a >nul 2>&1
        if !errorLevel! == 0 (
            set /a total_killed+=1
            echo    [✓] Successfully terminated CMD PID: %%~a
        ) else (
            echo    [!] Failed to terminate CMD PID: %%~a
        )
    )
)

echo.
echo [i] Session Termination Summary:
echo    Electron processes found: !electron_count!
echo    Node.js processes found: !node_count!
echo    npm processes found: !npm_count!
echo    Total processes terminated: !total_killed!
echo.

if !total_killed! gtr 0 (
    echo [✓] Successfully terminated !total_killed! session(s)
    echo [i] All Universal Path Config sessions have been stopped
) else (
    echo [i] No running Universal Path Config sessions found
    echo [i] All sessions appear to be already stopped
)

echo.
echo [i] Additional cleanup options:
echo  - Clear Electron cache: Delete "%USERPROFILE%\AppData\Roaming\Universal-Path-Config"
echo  - Clear local data: Delete "%USERPROFILE%\AppData\Local\Universal-Path-Config"
echo  - Reset node_modules: Delete the node_modules folder in the app directory
echo.

echo Press any key to exit...
pause >nul

endlocal 