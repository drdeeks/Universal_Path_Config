# Quick Start Guide - Universal Dev Setup

## 🚀 Fastest Way to Run the App

### 1. Double-Click Method (Easiest)

Simply **double-click** one of these files:

- **`run-as-admin.bat`** - Standard mode with automatic admin privileges
- **`run-as-admin-safe.bat`** - Safe mode (if you encounter cache issues)

The batch file will:
- ✅ Automatically request Administrator privileges
- ✅ Install npm dependencies if needed 
- ✅ Start the application with session management
- ✅ Show helpful status messages and session options
- ✅ Keep the window open if there are errors

**Session Management Options** are displayed on startup:
- Press `Ctrl+C` to stop current session
- Run `stop-all-sessions.bat` to end all sessions cleanly
- Use `kill-all-sessions.bat` for emergency termination

### 2. Command Line Method

Open PowerShell **as Administrator** and run:

```powershell
# Navigate to the project folder
cd C:\path\to\System_Dev_Env-Restructure

# Choose one:
npm start           # Standard mode
npm run start-safe  # Safe mode (for cache issues)
npm run dev         # Development mode with DevTools
```

## 🛠️ Which Mode to Use?

| Mode | When to Use | Command |
|------|-------------|---------|
| **Standard** | First time, normal usage | `run-as-admin.bat` or `npm start` |
| **Safe** | Cache permission errors | `run-as-admin-safe.bat` or `npm run start-safe` |
| **Development** | Debugging, development | `npm run dev` |

## ✨ What's New - Recent Improvements

### 🎨 Admin Status Display
- **Green**: ✅ Administrator Privileges: GRANTED (with green styling)
- **Red**: ❌ Administrator Privileges: REQUIRED (with red styling)
- **All text**: Now standardized to black for optimal readability

### 🔧 Session Management
- **Smart Control**: Built-in session management with clear options
- **Clean Shutdown**: `stop-all-sessions.bat` for graceful termination
- **Emergency Stop**: `kill-all-sessions.bat` for force termination
- **Process Detection**: Intelligent identification of running sessions

### 🧹 System Cleanup
- **Cleanup Button**: Orange "Cleanup Duplicates" button in the app
- **Duplicate Detection**: Finds and removes duplicate configuration files
- **Safe Backup**: All removed files backed up before deletion
- **Space Reporting**: Shows exactly how much space was freed

### 🐧 WSL Improvements
- **Accurate Detection**: Fixed UTF-16 encoding issues in WSL distribution counting
- **Timeout Protection**: No more hanging during cross-platform verification
- **Proper Parsing**: Removes null bytes and output contamination

## ⚠️ Requirements

- **Windows 10/11** (version 2004+ for WSL2)
- **Node.js 18+** installed
- **Administrator privileges** (batch files handle this automatically)
- **Internet connection** (for downloading development tools)

## 🔧 Common Issues & Solutions

**Cache Permission Errors?** → Use `run-as-admin-safe.bat`

**"Not recognized as internal command"?** → Install Node.js first

**"Access denied"?** → Use the batch files (they auto-request admin rights)

**App won't close?** → Use `stop-all-sessions.bat` or `kill-all-sessions.bat`

**WSL showing wrong count?** → Fixed in recent updates, restart WSL if needed

**Configure Paths Error?** → Fixed in latest version, use `update-executable.bat` to update

**Python not showing?** → Fixed in latest version, now detects Windows Python Launcher (`py` command)

## 🎛️ Session Management Commands

```bash
# Normal session control
Ctrl+C                    # Stop current session
stop-all-sessions.bat     # Clean shutdown of all sessions
kill-all-sessions.bat     # Emergency termination

# Check running sessions
tasklist | findstr "electron"  # See running Electron processes
tasklist | findstr "node"      # See Node.js processes
```

## 📱 What the App Does

This app provides a GUI to automatically install and configure:
- **Git, Node.js, Python, VS Code, Docker Desktop** - Core development tools
- **WSL2 + Ubuntu Linux subsystem** - Cross-platform development  
- **PowerShell profiles and terminal setup** - Enhanced command line
- **System cleanup and optimization** - Remove duplicate configurations
- **Cross-platform development environment** - Seamless Windows/Linux integration

### 🔄 Updating the App

**For Portable Executable Users:**
```bash
# Close the app first, then run:
update-executable.bat
```

**For Source Code Users:**
```bash
# Pull latest changes and restart
git pull
npm start
```

## 🧹 New Cleanup System

The app now includes a comprehensive cleanup system:
- **Duplicate Detection**: Finds duplicate configs across PowerShell, Git, VS Code, SSH, Node/NPM
- **Safe Backup**: Creates backup at `%APPDATA%\Local\dev-env-cleanup-backup\[date]`
- **Space Reporting**: Shows MB freed and category breakdown
- **One-Click Operation**: Orange "Cleanup Duplicates" button in the app

---

💡 **Tip**: The batch files are the easiest way to get started. Just double-click and go! Session management is now built-in for better control. 