# Universal Development Environment Setup v1.2.0

🚀 **Complete Windows development environment setup with one click** - featuring enhanced Python detection, robust path configuration, comprehensive cleanup system, and professional session management.

## ✨ Latest Features (v1.2.0)

### 🐍 **Enhanced Python Detection**
- **Multi-Command Support**: Detects Python via `python`, `python3`, and `py` commands
- **Windows Python Launcher**: Properly detects Python installed via Windows Store or python.org
- **WSL Fallback Detection**: Also checks for Python in WSL environment if Windows detection fails
- **Accurate Status Display**: Python now correctly appears in tool status with version info

### 🔧 **Robust Path Configuration**
- **Fixed Configuration Errors**: Resolved `[object Object]` errors with proper path resolution
- **Multiple Fallback Locations**: Enhanced error handling with comprehensive path detection
- **Safe Update System**: New `update-executable.bat` script for safe executable replacement
- **Real-time Feedback**: Detailed logging shows exactly where configuration files are found

### 🧹 **Comprehensive Cleanup System**
- **Duplicate Detection**: Content-based duplicate detection using file hashing
- **Smart Cleanup**: Removes duplicate configurations across all development tools
- **Safe Backup System**: Automatic backup before removal
- **Space Reporting**: Shows MB freed and category breakdown

### 🎛️ **Professional Session Management**
- **Smart Termination**: Targeted process management with detailed identification
- **Emergency Options**: Multiple termination methods for different scenarios
- **User Guidance**: Clear instructions displayed during startup
- **Process Detection**: Intelligent identification of Universal Path Config processes

## 🎯 Quick Start

### Option 1: Portable Executable (Recommended)
1. **Download**: Get `Universal Path Config 1.2.0 Portable.exe`
2. **Run as Admin**: Right-click → "Run as Administrator"
3. **Follow Setup**: Complete your development environment in minutes

### Option 2: From Source
```bash
# Clone and setup
git clone https://github.com/drdeeks/Universal-Path-Config.git
cd Universal-Path-Config
npm install

# Run with automatic admin privileges
run-as-admin.bat          # Standard mode
run-as-admin-safe.bat     # Safe mode (for cache issues)

# Or manually
npm start                 # Standard mode
npm run start-safe        # Safe mode
```

## 🛠️ What Gets Installed & Configured

### Core Development Tools
- **Node.js** (Latest LTS) - JavaScript runtime
- **Python** (Latest 3.x) - with pip and virtual environment support
- **Git** - Version control with SSH key setup
- **VS Code** - Code editor with development extensions
- **PowerShell** - Enhanced with development profiles

### System Integration
- **WSL2** - Windows Subsystem for Linux with Ubuntu
- **Windows Terminal** - Modern terminal with custom profiles
- **Environment Variables** - Optimized PATH configuration
- **Cross-platform Tools** - Seamless Windows/WSL workflow

### Professional Features
- **Admin Privilege Management** - Color-coded status indicators
- **Session Control** - Professional process management
- **System Cleanup** - Duplicate configuration removal
- **Automated Updates** - Safe executable replacement system

## 📖 Usage Guide

### First Run
1. **Launch Application** (as Administrator)
   - Green checkmark: ✅ Administrator Privileges: GRANTED
   - Red warning: ❌ Administrator Privileges: REQUIRED

2. **Environment Verification**
   - Click "Verify Environment" for system analysis
   - Real-time progress with proper completion messages
   - Accurate WSL distribution detection

3. **System Cleanup** (New Feature)
   - Click "Cleanup Duplicates" to scan for duplicate configurations
   - Safe backup creation before removal
   - Space reporting with detailed breakdown

4. **Tool Configuration**
   - Enter Git username and email
   - Select installation preferences
   - Choose which tools to install/configure

5. **Installation Process**
   - Real-time progress tracking
   - Live console output with colored logging
   - Automatic error detection and recovery

### Session Management
```bash
# Normal session control
Ctrl+C                    # Stop current session
stop-all-sessions.bat     # Clean shutdown of all sessions
kill-all-sessions.bat     # Emergency termination

# Check running sessions
tasklist | findstr "electron"  # See running Electron processes
```

### Updating Portable Executable
```bash
# Build new version
npm run build:portable

# Update safely (closes old, copies new)
update-executable.bat
```

## 🔧 Advanced Features

### Cleanup System Details
**Scans and consolidates:**
- PowerShell profiles across multiple locations
- Git configurations (.gitconfig, credentials)
- VS Code settings (User, Insiders, project-specific)
- SSH configurations and keys
- Node/NPM configurations (.npmrc, .yarnrc, .nvmrc)
- Terminal configurations
- Temporary files and caches

**Backup Location**: `%APPDATA%\Local\dev-env-cleanup-backup\[timestamp]\`

### Session Management
- **Smart Detection**: Identifies Universal Path Config processes specifically
- **Safe Termination**: Targeted process termination with detailed reporting
- **Emergency Mode**: Force-kill options for unresponsive sessions
- **Process Reporting**: Shows exactly what was terminated

### WSL Integration
- **Proper Encoding**: UTF-16 handling prevents distribution miscounting
- **Timeout Protection**: Prevents hanging during WSL verification
- **Error Recovery**: Robust error handling for WSL configuration
- **Cross-Platform Sync**: Seamless file and tool sharing

## 📊 Build Information

### Current Version: 1.2.0
- **Portable Executable**: `Universal Path Config 1.2.0 Portable.exe`
- **Build Target**: Windows x64
- **Dependencies**: Electron 33.2.0, electron-builder 25.1.8
- **Admin Requirements**: requireAdministrator execution level

### Build Commands
```bash
# Standard builds
npm run build:portable   # Portable executable
npm run build:installer  # NSIS installer
npm run build            # Both versions

# Utility commands
npm run clean            # Remove dist and node_modules
npm run rebuild          # Clean + install + build portable
npm run update           # Build + update executable
```

## 🔄 Migration from v1.0.0

### What's New
1. **Enhanced Python Detection** - Now finds Python via Windows Python Launcher
2. **Fixed Path Configuration** - No more `[object Object]` errors
3. **Comprehensive Cleanup** - Advanced duplicate file management
4. **Better Session Management** - Professional process control
5. **Updated Dependencies** - Latest Electron and build tools

### Updating Process
1. **Close Current Application**
2. **Download New Version** or build from source
3. **Run Update Script**: `update-executable.bat`
4. **Verify New Features**: Check Python detection and cleanup system

## 📁 Project Structure

```
Universal-Path-Config/
├── src/                          # Application source code
│   ├── index.html               # Main UI
│   ├── main.js                  # Electron main process (enhanced path resolution)
│   ├── renderer.js              # UI logic with cleanup system
│   └── styles.css               # Styling with color-coded admin status
├── assets/                      # Application assets
│   └── icon.svg                # SVG icon template
├── run-as-admin.bat             # Easy launcher with session management
├── run-as-admin-safe.bat        # Safe mode launcher
├── stop-all-sessions.bat        # Session termination script
├── kill-all-sessions.bat        # Emergency session killer
├── update-executable.bat        # Safe executable update script (enhanced)
├── diagnose-update-issue.bat    # Update troubleshooting tool
├── build-exe.ps1               # Build script for executables
├── rebuild.ps1                 # Quick rebuild script
├── setup-path-configs.ps1      # Path configuration script
├── dev-setup-script.txt        # PowerShell setup script
└── package.json                # Dependencies and build config (v1.2.0)
```

## 🛡️ Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Cache Permission Errors** | Use `run-as-admin-safe.bat` |
| **Update Script Fails** | Run `diagnose-update-issue.bat` as Administrator |
| **Python Not Detected** | Fixed in v1.2.0 - update your executable |
| **Configure Paths Error** | Fixed in v1.2.0 - use `update-executable.bat` |
| **Session Won't Close** | Use `stop-all-sessions.bat` or `kill-all-sessions.bat` |
| **WSL Count Wrong** | Fixed UTF-16 encoding - restart WSL if needed |

### Diagnostic Tools
- **`diagnose-update-issue.bat`** - Comprehensive update troubleshooting
- **`stop-all-sessions.bat`** - Clean session termination
- **`kill-all-sessions.bat`** - Emergency process termination
- **Admin Status Display** - Visual confirmation of privileges

## 🎯 Requirements

- **Windows 10/11** (version 2004+ for WSL2)
- **Node.js 18+** (for building from source)
- **Administrator privileges** (batch files handle this automatically)
- **Internet connection** (for downloading development tools)
- **~500MB disk space** (for full environment)

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test with both installer and portable builds
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/drdeeks/Universal-Path-Config/issues)
- **Documentation**: Check [QUICK-START.md](QUICK-START.md) for detailed guides
- **Build Issues**: Use diagnostic tools provided in the repository

---

**Universal Path Config v1.2.0** - Your complete Windows development environment, professionally automated. ✨ 

## Features

- 🔐 **Administrator Privilege Checking**: Automatically detects and validates administrator privileges required for system modifications
- ⚙️ **Tool Installation & Configuration**: Installs and configures Git, WSL, VS Code, Docker, Node.js, Python, and PowerShell
- 🔍 **Environment Verification**: Comprehensive verification of directory structure, configuration files, and tool integrations
- 🧹 **Duplicate Cleanup**: Identifies and removes duplicate configuration files and settings across different locations
- 📊 **Real-time Status**: Live monitoring of tool installation status and system configuration
- 💻 **Cross-platform Integration**: Seamless Windows and WSL environment integration
- 🛡️ **Safe Operations**: Backup creation before any system modifications
- 📦 **Project & Tool Migration**: Comprehensive migration system for organizing existing projects, tools, and configurations
- 🔄 **Smart Scanning**: Automatically detects existing development tools and project directories across your system
- 📁 **Centralized Organization**: Migrate everything to a single, well-organized directory structure 

## Post-Installation

After successful setup, you'll have access to these enhanced PowerShell functions:

### Navigation Commands
- `cdw` - Navigate to Windows home directory
- `cdwsl` - Navigate to WSL home directory  
- `cdprojects` - Navigate to Projects directory
- `cdcode` - Navigate to VS Code workspace

### Development Commands
- `new-project [name]` - Create new project with standard structure
- `dev-status` - Check development environment status
- `dev-update` - Update development environment
- `sync-env` - Synchronize configurations between Windows and WSL

### System Commands
- `restart-dev` - Restart development services
- `backup-configs` - Backup current configurations

## Project & Tool Migration

The Universal Path Config now includes powerful migration capabilities to help you organize your existing development environment. This feature allows you to consolidate all your projects, tools, and configurations into a single, well-organized location.

### How Migration Works

1. **Target Directory Selection**: Choose where you want your centralized development environment to be located
2. **Smart Scanning**: The app automatically scans your system for:
   - Development tools (Git, Node.js, Python, VS Code, Docker, etc.)
   - Project directories across common locations
   - Configuration files (PowerShell profiles, Git config, SSH keys, etc.)
3. **Selective Migration**: Choose exactly what you want to migrate with checkboxes
4. **Safe Migration**: Creates backups before moving anything
5. **Organized Structure**: Creates a clean directory structure in your target location

### Migration Features

#### 🔍 **Comprehensive Scanning**
- Scans system-wide for development tools in common installation paths
- Finds project directories in typical locations (Documents, Desktop, C:\ drives)
- Locates configuration files across Windows and user directories
- Handles wildcard patterns for version-specific tool installations

#### 📦 **Organized Directory Structure**
The migration creates a clean, organized structure:
```
Your-Target-Directory/
├── Projects/           # All your project directories
├── Tools/             # Development tools organized by type
│   ├── git/
│   ├── nodejs/
│   ├── python/
│   └── ...
├── Configs/           # Configuration files
├── Scripts/           # Utility scripts
├── Documentation/     # Project documentation
└── migration-backup/ # Backup of original files
```

#### 🛡️ **Safe Operations**
- **Automatic Backups**: Creates timestamped backups before any migration
- **Merge Options**: Choose to merge with existing files or skip duplicates
- **Progress Tracking**: Real-time progress updates and detailed logging
- **Error Handling**: Comprehensive error reporting and recovery

#### 📊 **Migration Results**
After migration, you get:
- Detailed summary of migrated items
- File count and size information
- Backup location details
- Any errors or warnings
- Next steps for updating your environment

### Using the Migration Feature

1. **Open Migration Section**: Click on the "📦 Project & Tool Migration" section
2. **Select Target Directory**: Click "Browse" to choose where to organize everything
3. **Scan Your System**: Click "Scan for Tools & Projects" to find existing items
4. **Choose What to Migrate**: Use checkboxes to select items for migration
5. **Configure Options**: 
   - ✅ Create backup before migration (recommended)
   - ✅ Merge with existing files
6. **Start Migration**: Click "Start Migration" and monitor progress
7. **Review Results**: Check the migration summary and follow next steps

### What Gets Migrated

#### Development Tools
- Git installations and configurations
- Node.js and npm
- Python installations and packages
- Visual Studio Code
- Docker Desktop
- PowerShell profiles
- Java JDK, Maven, Gradle
- Go, Rust toolchains
- WSL distributions

#### Project Directories
- Personal projects from Documents, Desktop
- Code repositories from various drives
- Development workspaces
- Project-specific configurations

#### Configuration Files
- Git global configuration
- SSH keys and configuration
- PowerShell profiles
- VS Code settings and keybindings
- Terminal configurations
- Environment variables
- NPM and package manager configs

### Post-Migration Steps

After migration, you should:

1. **Update Environment Variables**: Point PATH and other variables to new tool locations
2. **Update IDE Settings**: Configure your IDE to use tools from new locations
3. **Test Tool Access**: Verify all tools are accessible from command line
4. **Update Project References**: Check that projects still reference correct dependencies
5. **Backup Cleanup**: Review and clean up old backup files when satisfied

The migration feature makes it easy to maintain a clean, organized development environment and ensures all your tools and projects are easily accessible from a central location. 