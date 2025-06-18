# Universal Dev Setup - Build Script for Executable Creation
# This script automates the process of building executable versions

param(
    [switch]$SkipIconCheck,
    [switch]$BuildPortableOnly,
    [switch]$BuildInstallerOnly,
    [string]$Version = "1.0.0"
)

Write-Host "Universal Dev Setup - Executable Build Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to display status
function Write-Status($message, $type = "INFO") {
    switch ($type) {
        "SUCCESS" { Write-Host "[OK] $message" -ForegroundColor Green }
        "ERROR" { Write-Host "[ERROR] $message" -ForegroundColor Red }
        "WARNING" { Write-Host "[WARN] $message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[INFO] $message" -ForegroundColor Blue }
        default { Write-Host "$message" -ForegroundColor White }
    }
}

# Check prerequisites
Write-Host "`nChecking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Status "Node.js found: $nodeVersion" "SUCCESS"
} else {
    Write-Status "Node.js is required but not found. Please install Node.js 18+" "ERROR"
    exit 1
}

# Check NPM
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Status "NPM found: v$npmVersion" "SUCCESS"
} else {
    Write-Status "NPM is required but not found." "ERROR"
    exit 1
}

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Status "package.json found" "SUCCESS"
} else {
    Write-Status "package.json not found. Are you in the project root?" "ERROR"
    exit 1
}

# Check icon files
Write-Host "`nChecking Icon Files..." -ForegroundColor Yellow

$iconIco = "assets/icon.ico"
$iconSvg = "assets/icon.svg"

# Create SVG icon if it doesn't exist
if (-not (Test-Path $iconSvg)) {
    Write-Status "Creating SVG icon template..." "INFO"
    if (Test-Command "node") {
        node create-icon.js
        Write-Status "SVG icon template created" "SUCCESS"
    }
}

# Check for ICO file (required for Windows builds)
if (-not (Test-Path $iconIco) -and -not $SkipIconCheck) {
    Write-Status "ICO file not found: $iconIco" "WARNING"
    Write-Host ""
    Write-Host "To create the ICO file:" -ForegroundColor Cyan
    Write-Host "   1. Convert assets/icon.svg to PNG (256x256) using:" -ForegroundColor White
    Write-Host "      - Online SVG to PNG converter" -ForegroundColor Gray
    Write-Host "      - Inkscape (free desktop software)" -ForegroundColor Gray
    Write-Host "   2. Convert PNG to ICO using:" -ForegroundColor White
    Write-Host "      - https://convertico.com/ (recommended)" -ForegroundColor Gray
    Write-Host "      - https://www.png2ico.com/" -ForegroundColor Gray
    Write-Host "      - https://cloudconvert.com/png-to-ico" -ForegroundColor Gray
    Write-Host "   3. Save as: assets/icon.ico" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Continue build without icon? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Status "Build cancelled. Create icon.ico and try again." "INFO"
        exit 0
    }
    Write-Status "Continuing build without icon (executable will use default icon)" "WARNING"
}

# Install dependencies
Write-Host "`nInstalling Dependencies..." -ForegroundColor Yellow

Write-Status "Running npm install..." "INFO"
& npm install
if ($LASTEXITCODE -eq 0) {
    Write-Status "Dependencies installed successfully" "SUCCESS"
} else {
    Write-Status "Failed to install dependencies" "ERROR"
    exit 1
}

# Run postinstall script
Write-Status "Running postinstall script..." "INFO"
& npm run postinstall
if ($LASTEXITCODE -eq 0) {
    Write-Status "Postinstall completed successfully" "SUCCESS"
} else {
    Write-Status "Postinstall script failed (may be normal)" "WARNING"
}

# Clean previous builds
Write-Host "`nCleaning Previous Builds..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Write-Status "Removing old dist folder..." "INFO"
    Remove-Item -Recurse -Force "dist"
    Write-Status "Old build files removed" "SUCCESS"
}

# Build the application
Write-Host "`nBuilding Application..." -ForegroundColor Yellow

$buildCommand = "npm run build"

if ($BuildPortableOnly) {
    $buildCommand = "npm run build:portable"
    Write-Status "Building portable executable only..." "INFO"
} elseif ($BuildInstallerOnly) {
    $buildCommand = "npm run build:win"
    Write-Status "Building installer only..." "INFO"
} else {
    Write-Status "Building both installer and portable versions..." "INFO"
}

# Execute build
Invoke-Expression $buildCommand
if ($LASTEXITCODE -eq 0) {
    Write-Status "Build completed successfully!" "SUCCESS"
} else {
    Write-Status "Build failed. Check the error messages above." "ERROR"
    exit 1
}

# Verify build outputs
Write-Host "`nVerifying Build Outputs..." -ForegroundColor Yellow

$distPath = "dist"
if (-not (Test-Path $distPath)) {
    Write-Status "dist folder not created - build may have failed" "ERROR"
    exit 1
}

$buildFiles = Get-ChildItem $distPath -Filter "*.exe" | Sort-Object Name
if ($buildFiles.Count -eq 0) {
    Write-Status "No executable files found in dist folder" "ERROR"
    exit 1
}

Write-Status "Build outputs found:" "SUCCESS"
foreach ($file in $buildFiles) {
    $sizeMB = [math]::Round($file.Length / 1MB, 1)
    Write-Host "   FILE: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
}

# Show additional files
$otherFiles = Get-ChildItem $distPath -Filter "*" | Where-Object { $_.Extension -ne ".exe" -and $_.PSIsContainer -eq $false }
if ($otherFiles.Count -gt 0) {
    Write-Status "Additional build files:" "INFO"
    foreach ($file in $otherFiles) {
        Write-Host "   FILE: $($file.Name)" -ForegroundColor Gray
    }
}

# Show directories
$buildDirs = Get-ChildItem $distPath -Directory
if ($buildDirs.Count -gt 0) {
    Write-Status "Build directories:" "INFO"
    foreach ($dir in $buildDirs) {
        Write-Host "   DIR: $($dir.Name)/" -ForegroundColor Cyan
    }
}

# Display distribution information
Write-Host "`nDistribution Information:" -ForegroundColor Yellow

$installerFile = Get-ChildItem $distPath -Filter "*Setup*.exe" | Select-Object -First 1
$portableFile = Get-ChildItem $distPath -Filter "*Portable*.exe" | Select-Object -First 1

if ($installerFile) {
    Write-Host "NSIS Installer: $($installerFile.Name)" -ForegroundColor Green
    Write-Host "   [*] Professional installation wizard" -ForegroundColor Gray
    Write-Host "   [*] Start menu shortcuts" -ForegroundColor Gray
    Write-Host "   [*] Uninstaller included" -ForegroundColor Gray
    Write-Host "   [*] Registry integration" -ForegroundColor Gray
}

if ($portableFile) {
    Write-Host "Portable Executable: $($portableFile.Name)" -ForegroundColor Green
    Write-Host "   [*] No installation required" -ForegroundColor Gray
    Write-Host "   [*] Run from any location" -ForegroundColor Gray
    Write-Host "   [*] USB-friendly" -ForegroundColor Gray
}

# Display usage instructions
Write-Host "`nUsage Instructions:" -ForegroundColor Yellow

Write-Host "For End Users:" -ForegroundColor Cyan
if ($installerFile) {
    Write-Host "   1. Double-click: $($installerFile.Name)" -ForegroundColor White
    Write-Host "   2. Follow the installation wizard" -ForegroundColor White
    Write-Host "   3. Run from Start menu or desktop shortcut" -ForegroundColor White
}

if ($portableFile) {
    Write-Host "   OR" -ForegroundColor Gray
    Write-Host "   1. Right-click: $($portableFile.Name)" -ForegroundColor White
    Write-Host "   2. Select 'Run as administrator'" -ForegroundColor White
    Write-Host "   3. Follow the GUI setup process" -ForegroundColor White
}

Write-Host "`nFor Developers:" -ForegroundColor Cyan
Write-Host "   - Upload files to GitHub releases" -ForegroundColor White
Write-Host "   - Share via network drive or email" -ForegroundColor White
Write-Host "   - Test on clean Windows VMs first" -ForegroundColor White

# Final status
Write-Host "`nBuild Process Complete!" -ForegroundColor Green
Write-Host "Build artifacts are ready in the 'dist' folder." -ForegroundColor Green
Write-Host ""

# Open dist folder
$openDist = Read-Host "Open dist folder in Explorer? (Y/n)"
if ($openDist -ne "n" -and $openDist -ne "N") {
    Start-Process "explorer.exe" -ArgumentList (Resolve-Path $distPath)
} 