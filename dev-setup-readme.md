# Universal Development Environment Setup

A comprehensive PowerShell script that automatically configures a unified development environment with Git, WSL, VS Code, Docker, Node.js, and PowerShell on Windows machines.

## 🚀 Quick Start

### Prerequisites
- Windows 10/11 (version 2004 or higher for WSL2)
- PowerShell 5.1 or higher
- Administrator privileges
- Internet connection

### Easy Launch Methods

**🎯 Method 1: Batch Files (Recommended)**
```bash
# Simply double-click one of these files:
run-as-admin.bat          # Auto-handles admin privileges
run-as-admin-safe.bat     # Safe mode for cache issues
```

**💻 Method 2: Command Line**
```powershell
# Standard mode
npm start

# Safe mode (for cache permission errors)
npm run start-safe

# Development mode
npm run dev
```

**📜 Method 3: Original PowerShell Script**
```powershell
# Download and run (replace with your Git credentials)
.\setup-dev-environment.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"
```

## 📋 Table of Contents

- [What This Script Does](#what-this-script-does)
- [Installation Options](#installation-options)
- [Detailed Setup Process](#detailed-setup-process)
- [Post-Installation](#post-installation)
- [Available Commands](#available-commands)
- [Troubleshooting](#troubleshooting)
- [Manual Configuration](#manual-configuration)
- [FAQ](#faq)
- [Customization](#customization)

## 🎯 What This Script Does

### Core Tools Installed
- **Git** - Version control system
- **Node.js & NPM** - JavaScript runtime and package manager
- **VS Code** - Code editor with extensions
- **Docker Desktop** - Containerization platform
- **WSL2 + Ubuntu** - Linux subsystem for Windows
- **Chocolatey** - Windows package manager

### Configuration Applied
- **PowerShell Profile** - Custom aliases, functions, and environment variables
- **Git Configuration** - Global user settings, editor preferences, and credential management
- **WSL Integration** - Cross-platform file access and tool sharing
- **VS Code Settings** - Optimized settings and essential extensions
- **Windows Terminal** - Multi-environment terminal profiles
- **NPM Global Packages** - Essential development tools

### Environment Integration
- Seamless switching between Windows and Linux environments
- Unified Git configuration across all platforms
- Cross-platform file and directory access
- Shared development tools and configurations

## 🛠️ Installation Options

### Option 1: Complete Setup (Recommended for new machines)
```powershell
# Install everything from scratch
.\setup-dev-environment.ps1 -GitUserName "John Doe" -GitUserEmail "john@example.com"
```

### Option 2: Configuration Only
```powershell
# Skip installation, only configure existing tools
.\setup-dev-environment.ps1 -ConfigureOnly -GitUserName "John Doe" -GitUserEmail "john@example.com"
```

### Option 3: Skip Installation Phase
```powershell
# Skip tool installation but apply configurations
.\setup-dev-environment.ps1 -SkipInstallation
```

### Option 4: Interactive Setup
```powershell
# Script will prompt for Git credentials
.\setup-dev-environment.ps1
```

## 📖 Detailed Setup Process

### Phase 1: Prerequisites Installation

#### Chocolatey Installation
```powershell
# Automatic installation via script
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### Core Tools Installation
The script installs these tools in order:
1. **Git** - `choco install git -y`
2. **Node.js** - `choco install nodejs -y`
3. **Python** - `choco install python -y`
4. **VS Code** - `choco install vscode -y`
5. **Docker Desktop** - `choco install docker-desktop -y`
6. **Postman** - `choco install postman -y`
7. **Firefox** - `choco install firefox -y`

#### WSL Setup
```powershell
# Enable WSL and install Ubuntu
wsl --install --no-launch
wsl --install -d Ubuntu --no-launch
wsl --set-default Ubuntu
```

### Phase 2: Configuration

#### PowerShell Profile Setup
Location: `$PROFILE` (usually `$HOME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`)

**Key Features Added:**
- WSL integration aliases (`bash`, `ll`)
- Cross-platform tool functions (`git-wsl`, `code-wsl`)
- Quick navigation shortcuts (`cdw`, `cdwsl`, `cdprojects`)
- Development environment functions (`dev-status`, `dev-update`)

#### Git Global Configuration
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global core.autocrlf true
git config --global credential.helper manager-core
```

#### WSL Ubuntu Configuration
Location: `~/.bashrc` in WSL

**Features:**
- Windows PATH integration
- Cross-platform tool aliases
- Enhanced prompt with colors
- Docker integration
- Development shortcuts

#### VS Code Configuration
Location: `%APPDATA%\Code\User\settings.json`

**Settings Applied:**
- Multi-terminal support (PowerShell, WSL, Git Bash)
- Git integration preferences
- WSL remote development setup
- Auto-formatting and linting

**Extensions Installed:**
- Remote - WSL
- PowerShell
- Python
- Prettier
- ESLint
- GitLens
- Docker

### Phase 3: Testing and Verification

The script automatically tests all installed tools and configurations:
- Git version and configuration
- Node.js and NPM functionality
- Docker availability
- WSL status and Ubuntu access
- VS Code installation and extensions

## 🎉 Post-Installation

### Immediate Next Steps
1. **Restart your terminal** to apply all PATH changes
2. **Run verification command**: `dev-status`
3. **Test cross-platform access**: `cdwsl` then `code .`
4. **Clone a repository**: Navigate to Projects folder and test Git

### Directory Structure Created
```
C:\Users\[Username]\
├── Projects\                    # Your development projects
├── AppData\
│   ├── Roaming\npm\            # Global NPM packages
│   └── Roaming\Code\User\      # VS Code settings
└── Documents\
    └── WindowsPowerShell\      # PowerShell profile
```

### New Commands Available

#### Development Environment
```powershell
dev-status    # Check all tool versions and status
dev-update    # Update all development tools
```

#### Navigation
```powershell
cdw           # Go to Windows user home
cdwsl         # Go to WSL user home  
cdprojects    # Go to Projects directory
```

#### Cross-Platform Tools
```powershell
git-wsl       # Use Git in WSL context
git-win       # Use Git in Windows context
code-wsl      # Open VS Code from WSL
docker-wsl    # Use Docker in WSL context
```

#### Utility Aliases
```powershell
bash          # Open WSL bash shell
ll            # List files (WSL ls -la)
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Script Execution Policy Error
**Error:** `execution of scripts is disabled on this system`

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Or bypass for current session
powershell -ExecutionPolicy Bypass -File .\setup-dev-environment.ps1
```

#### 2. WSL Installation Fails
**Error:** `WSL installation requires a restart`

**Solution:**
1. Restart your computer
2. Run the script again with `-ConfigureOnly` flag
3. Manually enable WSL if needed:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
   Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
   ```

#### 3. Chocolatey Installation Issues
**Error:** `choco command not found after installation`

**Solution:**
```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
# Or restart PowerShell
```

#### 4. Git Credential Issues
**Error:** `Git authentication failed`

**Solution:**
```powershell
# Reconfigure Git credentials
git config --global credential.helper manager-core
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
# Test with a Git operation
git clone https://github.com/username/repo.git
```

#### 5. VS Code Extensions Not Installing
**Error:** `Extension installation failed`

**Solution:**
```powershell
# Install extensions manually
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension ms-vscode.powershell
# Or use VS Code Extensions marketplace
```

#### 6. Docker Desktop Not Starting
**Error:** `Docker daemon not running`

**Solution:**
1. Enable Hyper-V and Windows Subsystem for Linux
2. Restart Docker Desktop
3. Check WSL integration in Docker settings
4. Run: `wsl --update`

#### 7. Node.js/NPM Permission Issues
**Error:** `EACCES permission denied`

**Solution:**
```powershell
# Fix NPM global directory
npm config set prefix "$env:APPDATA\npm"
# Or use the configured directory
npm config set prefix "$env:USERPROFILE\.npm-global"
```

#### 8. WSL Ubuntu Not Accessible
**Error:** `WSL distribution not found`

**Solution:**
```powershell
# List available distributions
wsl --list --verbose
# Set default distribution
wsl --set-default Ubuntu
# Or install Ubuntu manually
wsl --install -d Ubuntu
```

#### 9. PowerShell Profile Not Loading
**Error:** `Custom commands not available`

**Solution:**
```powershell
# Check if profile exists
Test-Path $PROFILE
# Reload profile manually
. $PROFILE
# Or verify profile location
$PROFILE
```

#### 10. PATH Issues
**Error:** `Command not found despite installation`

**Solution:**
```powershell
# Check current PATH
$env:PATH -split ';'
# Add missing paths
$env:PATH += ";C:\Program Files\Git\bin"
# Make permanent via System Properties > Environment Variables
```

### Advanced Troubleshooting

#### Clean Reinstall Process
If you encounter persistent issues:

1. **Uninstall problematic tools:**
   ```powershell
   choco uninstall git nodejs vscode docker-desktop -y
   wsl --unregister Ubuntu
   ```

2. **Clear configuration files:**
   ```powershell
   Remove-Item $PROFILE -Force
   Remove-Item "$env:APPDATA\Code\User\settings.json" -Force
   ```

3. **Run script with clean installation:**
   ```powershell
   .\setup-dev-environment.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"
   ```

#### Logging and Debugging
Enable verbose logging:
```powershell
# Run with detailed output
.\setup-dev-environment.ps1 -Verbose -Debug
```

Check system logs:
```powershell
# Check Windows Event Logs
Get-EventLog -LogName Application -Source "Windows Subsystem for Linux" -Newest 10
```

## 🔨 Manual Configuration

If the automated script fails, you can configure components manually:

### Manual PowerShell Profile Setup
```powershell
# Create profile if it doesn't exist
if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -Type File -Force }

# Edit profile
notepad $PROFILE

# Add basic configuration
@'
$env:EDITOR = "code"
function cdprojects { Set-Location "C:\Users\$env:USERNAME\Projects" }
function dev-status { 
    git --version; node --version; npm --version; docker --version
}
'@ | Add-Content $PROFILE
```

### Manual Git Configuration
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
```

### Manual WSL Setup
```powershell
# Install WSL
wsl --install
# Install Ubuntu
wsl --install -d Ubuntu
# Set as default
wsl --set-default Ubuntu
```

### Manual VS Code Extensions
```powershell
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension ms-vscode.powershell
code --install-extension ms-python.python
```

## ❓ FAQ

### Q: Can I run this script multiple times?
**A:** Yes, the script is idempotent and safe to run multiple times. It will skip already installed components and update configurations.

### Q: Will this interfere with my existing development setup?
**A:** The script creates backups of configuration files and primarily adds new functionality. However, it may modify your PowerShell profile and Git global settings.

### Q: Can I customize which tools get installed?
**A:** Yes, you can modify the `$tools` array in the script or use the `-SkipInstallation` flag and install tools manually.

### Q: Does this work with different versions of Windows?
**A:** The script is designed for Windows 10 (version 2004+) and Windows 11. Some features may not work on older versions.

### Q: How do I uninstall everything?
**A:** Use Chocolatey to uninstall tools: `choco uninstall git nodejs vscode docker-desktop -y` and manually remove configuration files.

### Q: Can I use this in a corporate environment?
**A:** Check with your IT department first. Some organizations restrict package managers and WSL installations.

### Q: What if I prefer different tools (e.g., Vim instead of VS Code)?
**A:** You can modify the script to install your preferred tools or use the `-ConfigureOnly` flag after installing tools manually.

### Q: How do I keep everything updated?
**A:** Use the `dev-update` command created by the script, or manually update with `choco upgrade all -y`.

## 🎨 Customization

### Adding Custom Aliases
Edit your PowerShell profile (`$PROFILE`):
```powershell
# Add custom aliases
function myalias { Write-Host "Custom command" }
Set-Alias -Name ma -Value myalias
```

### Adding More Global NPM Packages
Modify the script or install manually:
```powershell
npm install -g typescript @angular/cli create-react-app
```

### Custom VS Code Settings
Edit `%APPDATA%\Code\User\settings.json`:
```json
{
    "editor.fontSize": 14,
    "workbench.colorTheme": "Dark+ (default dark)",
    "terminal.integrated.fontSize": 12
}
```

### Environment-Specific Configuration
Create environment-specific profiles:
```powershell
# Work profile
if ($env:COMPUTERNAME -eq "WORK-PC") {
    # Work-specific configurations
}

# Personal profile  
if ($env:COMPUTERNAME -eq "HOME-PC") {
    # Personal configurations
}
```

## 📞 Support

### Getting Help
1. **Check this README** for common issues
2. **Run diagnostic commands:**
   ```powershell
   dev-status
   wsl --status
   git config --list
   ```
3. **Check system requirements** and prerequisites
4. **Try manual configuration** for specific components

### Reporting Issues
When reporting issues, please include:
- Windows version (`winver`)
- PowerShell version (`$PSVersionTable`)
- Error messages and stack traces
- Output of `dev-status` command
- Steps to reproduce the issue

### Contributing
To improve this setup script:
1. Fork the repository
2. Make your improvements
3. Test on multiple Windows versions
4. Submit a pull request with detailed description

---

## 📄 License

This script is provided as-is for educational and development purposes. Feel free to modify and distribute according to your needs.

## 🔄 Version History

- **v1.0** - Initial release with basic tool installation
- **v1.1** - Added WSL integration and cross-platform support
- **v1.2** - Enhanced error handling and troubleshooting
- **v1.3** - Added VS Code extensions and Windows Terminal configuration
- **v1.4** - Improved testing and verification processes

---

*Happy coding! 🚀*