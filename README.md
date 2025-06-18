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
- **Process Detection**: Intelligent identification of Universal Dev Setup processes

## 🎯 Quick Start

### Option 1: Portable Executable (Recommended)
1. **Download**: Get `Universal Dev Setup 1.2.0 Portable.exe`
2. **Run as Admin**: Right-click → "Run as Administrator"
3. **Follow Setup**: Complete your development environment in minutes

### Option 2: From Source
```bash
# Clone and setup
git clone https://github.com/universal-dev-setup/universal-dev-setup.git
cd universal-dev-setup
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
- **Smart Detection**: Identifies Universal Dev Setup processes specifically
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
- **Portable Executable**: `Universal Dev Setup 1.2.0 Portable.exe`
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
universal-dev-setup/
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

- **Issues**: [GitHub Issues](https://github.com/universal-dev-setup/universal-dev-setup/issues)
- **Documentation**: Check [QUICK-START.md](QUICK-START.md) for detailed guides
- **Build Issues**: Use diagnostic tools provided in the repository

---

**Universal Dev Setup v1.2.0** - Your complete Windows development environment, professionally automated. ✨ 