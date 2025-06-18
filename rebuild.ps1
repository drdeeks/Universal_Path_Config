# Rebuild Script - Simple command to rebuild and override existing exe/bat files
# Usage: .\rebuild.ps1 [options]

param(
    [switch]$Portable,      # Build portable version only
    [switch]$Installer,     # Build installer version only
    [switch]$SkipIcon,      # Skip icon file checks
    [switch]$Force,         # Force overwrite without prompting
    [string]$Version = "1.0.0"
)

Write-Host ">> Quick Rebuild - Override Existing Files" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Function to display status
function Write-Status($message, $type = "INFO") {
    switch ($type) {
        "SUCCESS" { Write-Host "[OK] $message" -ForegroundColor Green }
        "ERROR" { Write-Host "[ERROR] $message" -ForegroundColor Red }
        "WARNING" { Write-Host "[WARN] $message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[INFO] $message" -ForegroundColor Blue }
    }
}

# Check if in correct directory
if (-not (Test-Path "package.json")) {
    Write-Status "Not in project root directory. Please run from project folder." "ERROR"
    exit 1
}

# Clean existing build outputs
Write-Host "`nCleaning Existing Files..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Write-Status "Removing existing dist folder..." "INFO"
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Status "Existing build files removed" "SUCCESS"
}

# Clean any old exe files in root
$oldExeFiles = Get-ChildItem -Filter "*.exe" -ErrorAction SilentlyContinue
if ($oldExeFiles.Count -gt 0) {
    Write-Status "Removing old exe files from root..." "INFO"
    $oldExeFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Status "Old exe files cleaned" "SUCCESS"
}

# Build new files
Write-Host "`nBuilding New Files..." -ForegroundColor Yellow

$buildArgs = @()

if ($SkipIcon) {
    $buildArgs += "-SkipIconCheck"
}

if ($Portable) {
    $buildArgs += "-BuildPortableOnly"
    Write-Status "Building portable version only..." "INFO"
} elseif ($Installer) {
    $buildArgs += "-BuildInstallerOnly"
    Write-Status "Building installer version only..." "INFO"
} else {
    Write-Status "Building all versions..." "INFO"
}

if ($Version -ne "1.0.0") {
    $buildArgs += "-Version", $Version
}

# Execute build script
$buildCommand = ".\build-exe.ps1"
if ($buildArgs.Count -gt 0) {
    $buildCommand += " " + ($buildArgs -join " ")
}

Write-Status "Executing: $buildCommand" "INFO"
Invoke-Expression $buildCommand

if ($LASTEXITCODE -eq 0) {
    Write-Status "Build completed successfully!" "SUCCESS"
} else {
    Write-Status "Build failed. Check error messages above." "ERROR"
    exit 1
}

# Copy new files to root (optional)
Write-Host "`nFinalizing..." -ForegroundColor Yellow

if (Test-Path "dist") {
    $newExeFiles = Get-ChildItem "dist" -Filter "*.exe"
    
    if ($newExeFiles.Count -gt 0) {
        Write-Status "New executable files created:" "SUCCESS"
        foreach ($file in $newExeFiles) {
            $sizeMB = [math]::Round($file.Length / 1MB, 1)
            Write-Host "   FILE: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        }
        
        # Ask if user wants to copy to root for easy access
        if (-not $Force) {
            Write-Host ""
            $copyToRoot = Read-Host "Copy executables to project root for easy access? (y/N)"
            if ($copyToRoot -eq "y" -or $copyToRoot -eq "Y") {
                foreach ($file in $newExeFiles) {
                    Copy-Item $file.FullName "." -Force
                    Write-Status "Copied $($file.Name) to project root" "SUCCESS"
                }
            }
        }
    } else {
        Write-Status "No executable files found after build" "WARNING"
    }
} else {
    Write-Status "Dist folder not found after build" "ERROR"
    exit 1
}

Write-Host "`nRebuild Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Build outputs are in: dist/" -ForegroundColor Cyan
Write-Host "Ready to deploy new version!" -ForegroundColor Green
Write-Host ""

# Optional: Show quick usage commands
Write-Host "Quick commands for next time:" -ForegroundColor Yellow
Write-Host "   .\rebuild.ps1              # Build all versions" -ForegroundColor White
Write-Host "   .\rebuild.ps1 -Portable    # Portable version only" -ForegroundColor White
Write-Host "   .\rebuild.ps1 -Installer   # Installer version only" -ForegroundColor White
Write-Host "   .\rebuild.ps1 -Force       # No prompts, auto-copy" -ForegroundColor White 