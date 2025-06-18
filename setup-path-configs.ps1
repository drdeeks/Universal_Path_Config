# Universal Development Environment - Path Configuration Setup
# This script configures all terminals and applications to use consistent paths

param(
    [switch]$Force,
    [switch]$Backup,
    [string]$ProjectsPath = "$env:USERPROFILE\Projects"
)

Write-Host "Universal Development Environment - Path Configuration Setup" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Gray

# Ensure we're running with admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[WARN] This script requires Administrator privileges for full configuration." -ForegroundColor Yellow
    Write-Host "   Some configurations may be skipped or incomplete." -ForegroundColor Yellow
    Write-Host ""
}

# Create Projects directory if it doesn't exist
if (!(Test-Path $ProjectsPath)) {
    Write-Host "Creating Projects directory: $ProjectsPath" -ForegroundColor Cyan
    New-Item -Path $ProjectsPath -ItemType Directory -Force | Out-Null
    Write-Host "[OK] Projects directory created" -ForegroundColor Green
} else {
    Write-Host "[OK] Projects directory already exists: $ProjectsPath" -ForegroundColor Green
}

# Function to backup existing file
function Backup-ConfigFile {
    param([string]$FilePath)
    
    if ((Test-Path $FilePath) -and $Backup) {
        $backupPath = "$FilePath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $FilePath $backupPath
        Write-Host "[BACKUP] Backed up existing config to: $backupPath" -ForegroundColor Yellow
    }
}

# Function to install Git Bash profile
function Install-GitBashProfile {
    Write-Host "Configuring Git Bash..." -ForegroundColor Cyan
    
    $gitBashProfilePath = "$env:USERPROFILE\.bash_profile"
    $configSource = "config\git-bash-profile.sh"
    
    if (Test-Path $configSource) {
        Backup-ConfigFile $gitBashProfilePath
        
        # Read the Git Bash profile template and replace variables
        $profileContent = Get-Content $configSource -Raw
        $profileContent = $profileContent -replace '\$USERNAME', $env:USERNAME
        $profileContent = $profileContent -replace '\$USERPROFILE', $env:USERPROFILE
        
        Set-Content -Path $gitBashProfilePath -Value $profileContent -Encoding UTF8
        Write-Host "[OK] Git Bash profile configured" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Git Bash profile template not found: $configSource" -ForegroundColor Yellow
    }
}

# Function to install VS Code workspace
function Install-VSCodeWorkspace {
    Write-Host "Configuring VS Code workspace..." -ForegroundColor Cyan
    
    $workspaceSource = "config\dev-workspace.code-workspace"
    $workspaceTarget = "$ProjectsPath\dev-workspace.code-workspace"
    
    if (Test-Path $workspaceSource) {
        Backup-ConfigFile $workspaceTarget
        Copy-Item $workspaceSource $workspaceTarget -Force
        Write-Host "[OK] VS Code workspace created at: $workspaceTarget" -ForegroundColor Green
        Write-Host "[INFO] Open this workspace in VS Code for optimal development experience" -ForegroundColor Cyan
    } else {
        Write-Host "[WARN] VS Code workspace template not found: $workspaceSource" -ForegroundColor Yellow
    }
}

# Function to create Windows Terminal shortcuts
function Install-TerminalShortcuts {
    Write-Host "Creating terminal shortcuts..." -ForegroundColor Cyan
    
    $shortcutsDir = "$env:USERPROFILE\Desktop\Dev Environment"
    if (!(Test-Path $shortcutsDir)) {
        New-Item -Path $shortcutsDir -ItemType Directory -Force | Out-Null
    }
    
    # PowerShell shortcut
    $powershellShortcut = "$shortcutsDir\PowerShell Projects.lnk"
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($powershellShortcut)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-NoLogo -ExecutionPolicy Bypass -Command ""Set-Location '$ProjectsPath'; powershell"""
    $Shortcut.WorkingDirectory = $ProjectsPath
    $Shortcut.Description = "PowerShell in Projects directory"
    $Shortcut.Save()
    
    # Git Bash shortcut
    $gitBashPath = "${env:ProgramFiles}\Git\bin\bash.exe"
    if (Test-Path $gitBashPath) {
        $gitBashShortcut = "$shortcutsDir\Git Bash Projects.lnk"
        $Shortcut = $WshShell.CreateShortcut($gitBashShortcut)
        $Shortcut.TargetPath = $gitBashPath
        $Shortcut.Arguments = "-i -l"
        $Shortcut.WorkingDirectory = $ProjectsPath
        $Shortcut.Description = "Git Bash in Projects directory"
        $Shortcut.Save()
    }
    
    # VS Code shortcut
    if (Get-Command code -ErrorAction SilentlyContinue) {
        $vscodeShortcut = "$shortcutsDir\VS Code Projects.lnk"
        $Shortcut = $WshShell.CreateShortcut($vscodeShortcut)
        $Shortcut.TargetPath = (Get-Command code).Source
        $Shortcut.Arguments = """$ProjectsPath"""
        $Shortcut.WorkingDirectory = $ProjectsPath
        $Shortcut.Description = "VS Code in Projects directory"
        $Shortcut.Save()
    }
    
    Write-Host "[OK] Desktop shortcuts created in: $shortcutsDir" -ForegroundColor Green
}

# Function to configure environment variables
function Set-EnvironmentVariables {
    Write-Host "Setting environment variables..." -ForegroundColor Cyan
    
    # Set user environment variables
    [Environment]::SetEnvironmentVariable("DEV_HOME", $ProjectsPath, "User")
    [Environment]::SetEnvironmentVariable("PROJECTS", $ProjectsPath, "User")
    
    # Update current session
    $env:DEV_HOME = $ProjectsPath
    $env:PROJECTS = $ProjectsPath
    
    Write-Host "[OK] Environment variables set:" -ForegroundColor Green
    Write-Host "   DEV_HOME = $ProjectsPath" -ForegroundColor White
    Write-Host "   PROJECTS = $ProjectsPath" -ForegroundColor White
}

# Function to create startup script
function New-StartupScript {
    Write-Host "Creating startup script..." -ForegroundColor Cyan
    
    $startupScript = @"
# Universal Development Environment Startup Script
# This script runs when PowerShell starts and ensures proper path setup

# Ensure Projects directory exists
if (!(Test-Path "$ProjectsPath")) {
    New-Item -Path "$ProjectsPath" -ItemType Directory -Force | Out-Null
}

# Set location to Projects if not already in a project
if ((Get-Location).Path -eq "$env:USERPROFILE") {
    Set-Location "$ProjectsPath"
}

# Display welcome message
Write-Host "Development Environment Ready!" -ForegroundColor Green
Write-Host "Projects: $ProjectsPath" -ForegroundColor Cyan
Write-Host "Quick commands: cdprojects, dev-status, new-project" -ForegroundColor Yellow
"@

    $startupScriptPath = "$ProjectsPath\dev-startup.ps1"
    Set-Content -Path $startupScriptPath -Value $startupScript -Encoding UTF8
    
    Write-Host "[OK] Startup script created: $startupScriptPath" -ForegroundColor Green
    Write-Host "[INFO] Add this to your PowerShell profile to run automatically" -ForegroundColor Cyan
}

# Function to update PowerShell profile
function Update-PowerShellProfile {
    Write-Host "Updating PowerShell profile..." -ForegroundColor Cyan
    
    $profilePath = $PROFILE.AllUsersAllHosts
    if (!(Test-Path $profilePath)) {
        $profilePath = $PROFILE.CurrentUserCurrentHost
        $profileDir = Split-Path $profilePath -Parent
        if (!(Test-Path $profileDir)) {
            New-Item -Path $profileDir -ItemType Directory -Force | Out-Null
        }
    }
    
    $profileAddition = @"

# Universal Development Environment - Auto-generated section
# Default to Projects directory and load development functions
if (Test-Path "$ProjectsPath\dev-startup.ps1") {
    . "$ProjectsPath\dev-startup.ps1"
}
"@

    # Check if our configuration is already added
    if (Test-Path $profilePath) {
        $existingContent = Get-Content $profilePath -Raw
        if ($existingContent.IndexOf("Universal Development Environment") -eq -1) {
            Add-Content -Path $profilePath -Value $profileAddition
            Write-Host "[OK] PowerShell profile updated" -ForegroundColor Green
        } else {
            Write-Host "[OK] PowerShell profile already configured" -ForegroundColor Green
        }
    } else {
        Set-Content -Path $profilePath -Value $profileAddition
        Write-Host "[OK] PowerShell profile created and configured" -ForegroundColor Green
    }
}

# Function to clean up excess WSL distributions
function Remove-ExcessWSLDistributions {
    Write-Host "Checking WSL distributions..." -ForegroundColor Cyan
    
    try {
        # Get list of WSL distributions
        $wslOutput = wsl --list --verbose 2>$null
        if ($wslOutput) {
            $distributions = $wslOutput | Where-Object { $_ -match '\*?\s*(\S+)\s+' } | ForEach-Object {
                if ($_ -match '\*?\s*(\S+)\s+') {
                    $matches[1]
                }
            } | Where-Object { $_ -and $_ -ne 'NAME' -and $_ -notlike '*docker*' }
            
            if ($distributions.Count -gt 1) {
                Write-Host "[WARN] Found $($distributions.Count) WSL distributions:" -ForegroundColor Yellow
                $distributions | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
                
                # Keep only Ubuntu or Ubuntu-latest, remove others
                $preferredDistros = @('Ubuntu', 'Ubuntu-22.04', 'Ubuntu-20.04')
                $toKeep = $distributions | Where-Object { $_ -in $preferredDistros } | Select-Object -First 1
                
                if (-not $toKeep) {
                    $toKeep = $distributions[0]  # Keep the first one if no preferred found
                }
                
                $toRemove = $distributions | Where-Object { $_ -ne $toKeep }
                
                if ($toRemove.Count -gt 0) {
                    Write-Host "[INFO] Keeping: $toKeep" -ForegroundColor Green
                    Write-Host "[INFO] Removing excess distributions:" -ForegroundColor Cyan
                    
                    foreach ($distro in $toRemove) {
                        try {
                            Write-Host "   Removing: $distro" -ForegroundColor Yellow
                            wsl --unregister $distro
                            Write-Host "   [OK] Removed: $distro" -ForegroundColor Green
                        } catch {
                            Write-Host "   [ERROR] Failed to remove $distro`: $_" -ForegroundColor Red
                        }
                    }
                } else {
                    Write-Host "[OK] Only one distribution found, no cleanup needed" -ForegroundColor Green
                }
            } else {
                Write-Host "[OK] Found $($distributions.Count) user WSL distribution(s), no cleanup needed" -ForegroundColor Green
                if ($distributions.Count -eq 1) {
                    Write-Host "   Active distribution: $($distributions[0])" -ForegroundColor Cyan
                }
            }
        } else {
            Write-Host "[INFO] No WSL distributions found" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "[WARN] Could not check WSL distributions: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Function to display final instructions
function Show-CompletionInstructions {
    Write-Host ""
    Write-Host "Path Configuration Complete!" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Gray
    Write-Host ""
    Write-Host "What was configured:" -ForegroundColor Cyan
    Write-Host "   - Projects directory: $ProjectsPath" -ForegroundColor White
    Write-Host "   - Git Bash profile with path defaults" -ForegroundColor White
    Write-Host "   - VS Code workspace configuration" -ForegroundColor White
    Write-Host "   - Desktop shortcuts for quick access" -ForegroundColor White
    Write-Host "   - Environment variables (DEV_HOME, PROJECTS)" -ForegroundColor White
    Write-Host "   - PowerShell startup configuration" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Restart your terminal applications" -ForegroundColor White
    Write-Host "   2. Open VS Code workspace: $ProjectsPath\dev-workspace.code-workspace" -ForegroundColor White
    Write-Host "   3. Run the Universal Development Environment Setup app to install development tools" -ForegroundColor White
    Write-Host ""
    Write-Host "[INFO] All terminals should now open in the Projects directory!" -ForegroundColor Green
}

# Main execution
try {
    Install-GitBashProfile
    Install-VSCodeWorkspace
    Install-TerminalShortcuts
    Set-EnvironmentVariables
    New-StartupScript
    Update-PowerShellProfile
    Remove-ExcessWSLDistributions
    Show-CompletionInstructions
} catch {
    Write-Host "[ERROR] Error during configuration: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error and try again, or run with -Force to overwrite existing configurations" -ForegroundColor Yellow
}

Write-Host "" 