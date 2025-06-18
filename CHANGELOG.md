# Universal Dev Setup - Changelog

## [1.3.0] - 2024-12-19

### Added
- **🚀 Project & Tool Migration System**: Comprehensive migration capabilities to organize existing development environments
  - Smart scanning for development tools across system-wide locations
  - Project directory discovery in common locations (Documents, Desktop, various drives)
  - Configuration file detection and migration
  - Selective migration with checkbox interface
  - Safe operations with automatic backup creation
  - Organized directory structure creation
  - Real-time progress tracking and detailed logging
  - Migration results summary with error reporting

- **📦 Migration Features**:
  - Directory selection dialog for target location
  - Comprehensive tool scanning (Git, Node.js, Python, VS Code, Docker, Java, Maven, Gradle, Go, Rust, WSL)
  - Project directory scanning across multiple drives and common locations
  - Configuration file migration (PowerShell profiles, Git config, SSH keys, VS Code settings, etc.)
  - Merge options for handling existing files
  - Timestamped backup creation
  - Migration summary with file counts and sizes

- **🛡️ Enhanced Safety**:
  - Automatic backup creation before any migration
  - Error handling and recovery mechanisms
  - Comprehensive logging of all migration operations
  - Rollback capabilities through backup system

- **🎨 UI Improvements**:
  - New migration interface with clean, organized layout
  - Progress tracking with visual indicators
  - Responsive design for migration components
  - Interactive scan results with selection controls

### Enhanced
- Improved documentation with detailed migration guide
- Updated package metadata and keywords
- Enhanced release notes and version tracking

### Technical
- Added new IPC handlers for migration operations
- Implemented recursive directory copying functionality
- Enhanced file size calculation utilities
- Improved error handling across migration operations

## [1.2.0] - 2024-12-18 - Python Detection & Path Configuration Fix

### 🆕 New Features

#### Enhanced Python Detection
- **Multi-Command Support**: Detects Python via `python`, `python3`, and `py` commands
- **Windows Python Launcher**: Properly detects Python installed via Windows Store or python.org
- **WSL Fallback Detection**: Also checks for Python in WSL environment if Windows detection fails
- **Accurate Status Display**: Python now correctly appears in tool status with version info (e.g., "Python 3.13.5")

#### Configure Paths Error Resolution
- **Robust Path Resolution**: Fixed executable path finding with multiple fallback locations
- **Enhanced Error Messages**: Replaced `[object Object]` errors with clear, descriptive messages
- **Safe Update System**: New `update-executable.bat` script for safe executable replacement
- **Detailed Logging**: Shows exactly where configuration files are found during execution

### 🔧 Technical Improvements

#### Path Configuration System
- **Primary Path**: Uses `process.cwd()` for reliable current working directory detection
- **Fallback Mechanism**: Multiple alternative locations checked automatically:
  - `__dirname/../setup-path-configs.ps1`
  - `process.resourcesPath/setup-path-configs.ps1`
  - `process.execPath/../setup-path-configs.ps1`
- **Error Serialization**: Proper error object handling for IPC communication
- **User Feedback**: Real-time console output showing path resolution progress

#### Executable Update Process
- **Process Management**: Automatically stops running instances before update
- **Error Handling**: Comprehensive error checking with user-friendly messages
- **Safe Replacement**: Ensures old executable is properly removed before copying new one
- **Validation**: Verifies new executable exists before attempting replacement

### 🐍 Python Integration

#### Detection Improvements
- **Windows Python Launcher**: Specifically handles `py` command for Windows installations
- **Cross-Platform Support**: Seamless detection across Windows and WSL environments
- **Version Reporting**: Accurate version strings displayed in tool status
- **Installation Guidance**: Clear feedback when Python is not detected

### 🚀 User Experience

#### Updated Documentation
- **README.md**: Added troubleshooting section for configure-paths errors
- **Project Structure**: Updated to include new `update-executable.bat` script
- **Build Instructions**: Enhanced with safe update procedures

#### Error Handling
- **Meaningful Messages**: No more cryptic `[object Object]` errors
- **Detailed Feedback**: Shows all attempted paths when files not found
- **Recovery Instructions**: Clear guidance on how to resolve path issues

### 📁 File Changes

#### New Files
- `update-executable.bat` - Safe executable update script
- `CONFIGURE-PATHS-FIX.md` - Detailed documentation of the path configuration fix

#### Modified Files
- `src/main.js` - Enhanced path resolution and error handling
- `README.md` - Updated troubleshooting and project structure sections
- `CHANGELOG.md` - This comprehensive update log

### 🧪 Testing & Validation

#### Verified Functionality
- ✅ **Python Detection**: Correctly identifies Python 3.13.5 via `py` command
- ✅ **Path Configuration**: Successfully finds and executes `setup-path-configs.ps1`
- ✅ **Error Messages**: Clear, descriptive error reporting
- ✅ **Update Process**: Safe executable replacement without conflicts

### 📊 Performance Impact

#### Before This Update
- ❌ Python not detected despite being installed via Windows Store/python.org
- ❌ Configure Paths failed with `[object Object]` error
- ❌ Path resolution fragile in built executables
- ❌ No safe way to update executables while running

#### After This Update
- ✅ Python correctly detected and displayed in tool status
- ✅ Configure Paths works reliably with clear error messages
- ✅ Robust path finding with multiple fallback locations
- ✅ Safe executable update process with comprehensive error handling

## [v1.1.0] - 2024-01-XX - Session Management & System Cleanup Update

### 🆕 New Features

#### Session Management System
- **Session Control**: Added comprehensive session management with clear user instructions
- **Smart Termination**: New `stop-all-sessions.bat` script for clean shutdown of all app instances
- **Emergency Failsafe**: New `kill-all-sessions.bat` script for force termination when needed
- **Process Detection**: Intelligent identification of Universal Dev Setup processes
- **User Guidance**: Built-in session management instructions displayed on startup

#### Advanced Cleanup System
- **Duplicate File Detection**: Content-based duplicate detection using file hashing
- **Smart Cleanup**: Removes duplicate configurations across all development tools
- **Safe Backup System**: Automatic backup to `AppData\Local\dev-env-cleanup-backup\[date]`
- **Space Reporting**: Shows MB freed and category breakdown of cleaned files
- **Comprehensive Coverage**: PowerShell profiles, Git configs, VS Code settings, SSH, Node/NPM configs
- **Temporary Cleanup**: npm cache, yarn cache, VS Code logs, and other temp files
- **UI Integration**: Orange "Cleanup Duplicates" button in main interface

### 🎨 User Interface Improvements

#### Admin Privileges Display
- **Color-Coded Status**: Green for granted admin privileges, red for missing
- **Visual Feedback**: "✅ Administrator Privileges: GRANTED" with green styling
- **Clear Warnings**: "❌ Administrator Privileges: REQUIRED" with red styling
- **Pulsing Animations**: Enhanced visual feedback for status indicators

#### Text Readability
- **Standardized Colors**: All text elements now black (#000000) for optimal readability
- **Improved Contrast**: Better visibility across all UI elements
- **Consistent Styling**: Unified text styling throughout the application

### 🐧 Cross-Platform Fixes

#### WSL Integration Improvements
- **UTF-16 Encoding Fix**: Proper handling of PowerShell output encoding issues
- **Accurate Distribution Detection**: Fixed WSL distribution counting (Ubuntu, docker-desktop = 2)
- **Null Byte Removal**: Removes null bytes and output contamination from WSL commands
- **Tool Status Sync**: Tool status display now matches verification results
- **PowerShell Integration**: Fixed string terminator errors in configuration

#### Timeout Protection
- **No More Hanging**: Cross-platform verification no longer hangs indefinitely
- **Configurable Timeouts**: 5-10 second timeouts for WSL operations
- **Error Recovery**: Robust error handling for WSL and PowerShell operations
- **Progress Completion**: All verification steps now complete successfully

### 🛠️ Technical Improvements

#### Application Stability
- **Error Handling**: Comprehensive try-catch blocks around critical operations
- **Timeout Implementation**: `runCommandWithTimeout()` function for WSL operations
- **Process Management**: Better handling of child processes and cleanup
- **Memory Management**: Improved resource cleanup and management

#### Build System Enhancements
- **Session Management Integration**: All executable builds include session control features
- **Feature Complete**: Both installer and portable versions include all improvements
- **Documentation Updates**: All build documentation reflects current capabilities

### 🗂️ Repository Cleanup

#### File Organization
- **Removed Redundant Files**: 
  - `assets/icon-needed.txt` (redundant with build documentation)
  - `assets/icon-conversion-needed.txt` (redundant with build instructions)
- **Updated Documentation**: All markdown files updated with current features
- **Consistent Structure**: Standardized file organization and naming

#### Documentation Overhaul
- **README.md**: Complete rewrite with all current features and improvements
- **QUICK-START.md**: Updated with session management and new features
- **EXE-BUILD-STATUS.md**: Updated to reflect working build system
- **New CHANGELOG.md**: This comprehensive change log

### 🔧 Session Management Commands

```bash
# Normal session control
Ctrl+C                    # Stop current session
stop-all-sessions.bat     # Clean shutdown of all sessions
kill-all-sessions.bat     # Emergency termination

# Process monitoring
tasklist | findstr "electron"  # See running Electron processes
tasklist | findstr "node"      # See Node.js processes
```

### 🧹 Cleanup Categories

The new cleanup system handles:
- **PowerShell Profiles**: Multiple profile locations consolidated to one
- **Git Configurations**: Duplicate .gitconfig and credential files
- **VS Code Settings**: User, Insiders, and project-specific settings
- **SSH Configurations**: Multiple SSH config and key files
- **Node/NPM Configs**: .npmrc, .yarnrc, .nvmrc files across locations
- **Terminal Configurations**: Windows Terminal settings duplicates
- **Temporary Files**: npm cache, yarn cache, VS Code logs

### 📊 Performance Improvements

#### Before This Update
- ❌ Application could hang indefinitely during WSL verification
- ❌ WSL distribution count showed 5 instead of 2 (UTF-16 encoding issues)
- ❌ No way to cleanly stop sessions
- ❌ No duplicate file cleanup capability
- ❌ Poor text contrast and readability
- ❌ Admin status not clearly visible

#### After This Update
- ✅ All verification completes within reasonable timeouts
- ✅ Accurate WSL distribution detection (2 distributions)
- ✅ Multiple session management options
- ✅ Comprehensive cleanup system with safe backups
- ✅ Excellent text readability with black text
- ✅ Clear color-coded admin status display

### 🚀 Distribution Impact

#### For End Users
- **Professional Experience**: Clear status indicators and smooth operation
- **Session Control**: Multiple options for managing running sessions
- **System Optimization**: Built-in cleanup for duplicate configurations
- **Enhanced Stability**: No more hanging or timeout issues

#### For Developers
- **Complete Build System**: All features integrated into executable builds
- **Session Management**: Built-in process control and emergency termination
- **System Cleanup**: Advanced file management and optimization
- **Robust Error Handling**: Better stability and user experience

#### For System Administrators
- **Reliable Deployment**: Stable application with proper session management
- **System Maintenance**: Built-in cleanup reduces configuration conflicts
- **Process Control**: Multiple options for managing application sessions
- **Professional Integration**: Proper Windows integration and behavior

## [v1.0.0] - Previous Release

### Initial Features
- GUI interface for development environment setup
- Administrator privilege checking
- Environment verification and tool installation
- Cross-platform WSL integration
- VS Code and development tool configuration
- PowerShell profile enhancement
- Executable build system

---

## Migration Notes

### For Existing Users
1. **Update Application**: Download and run the latest version
2. **Use Session Management**: Familiarize yourself with new session control options
3. **Try Cleanup System**: Use the new cleanup feature to optimize your system
4. **Check Admin Status**: Verify the new color-coded admin privilege display

### For New Users
1. **Follow Quick Start**: Use the updated [QUICK-START.md](QUICK-START.md) guide
2. **Use Batch Files**: Leverage `run-as-admin.bat` for automatic session management
3. **Explore Cleanup**: Try the cleanup system to maintain optimal configuration
4. **Read Documentation**: All guides updated with current features

---

## Future Roadmap

### Planned Features
- **Auto-update System**: Automatic application updates
- **Plugin Architecture**: Extensible tool system
- **Cloud Integration**: Configuration backup and sync
- **Advanced Telemetry**: Usage analytics and improvement data

### Community Requests
- Additional development tool integrations
- Custom configuration templates
- Batch deployment tools
- Enhanced reporting capabilities

---

**Made with ❤️ for the developer community** 