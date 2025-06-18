# Terminal and Path Configuration Guide

## Overview

The Universal Development Environment Setup now includes comprehensive path configuration that ensures all terminals, applications, and development tools open to the correct directories and use consistent paths.

## What Gets Configured

### 1. PowerShell Profile Enhancement

**Location:** `%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`

**Features:**
- Automatically sets default directory to `%USERPROFILE%\Projects`
- Enhanced navigation functions (`cdprojects`, `cdwsl`, `cdw`)
- Cross-platform development aliases
- Development environment status checking (`dev-status`)
- Project creation utilities (`new-project`)
- WSL integration commands
- Welcome messages with current location info

**Key Commands Added:**
```powershell
cdprojects      # Navigate to Projects directory
cdwsl          # Navigate to WSL home
cdw            # Navigate to Windows home
dev-status     # Show development tools status
new-project    # Create new project with structure
dev-update     # Update all development tools
```

### 2. Git Bash Profile

**Location:** `%USERPROFILE%\.bash_profile`

**Features:**
- Automatically opens in Projects directory
- Enhanced Git aliases for faster workflow
- Windows integration commands
- Colored prompt with Git branch display
- Development shortcuts and status functions

**Key Commands Added:**
```bash
cdprojects     # Navigate to Projects directory
cdwin          # Navigate to Windows home
gs             # git status
ga             # git add
gc             # git commit
gp             # git push
gl             # git pull
dev-status     # Show development environment status
new-project    # Create new project
```

### 3. Windows Terminal Configuration

**Location:** `%USERPROFILE%\AppData\Local\Packages\Microsoft.WindowsTerminal_*\LocalState\settings.json`

**Features:**
- Multiple optimized profiles for different environments
- All profiles default to appropriate project directories
- Enhanced color schemes and formatting
- Improved terminal behavior and history

**Profiles Added:**
- **PowerShell (Dev):** Opens in `%USERPROFILE%\Projects`
- **WSL Ubuntu (Dev):** Opens in WSL home directory
- **WSL Projects:** Opens in WSL projects directory
- **Git Bash (Dev):** Opens in `%USERPROFILE%\Projects`

### 4. VS Code Workspace Configuration

**Location:** `%USERPROFILE%\Projects\dev-workspace.code-workspace`

**Features:**
- Multi-folder workspace with Windows and WSL project directories
- Optimized terminal profiles for development
- Enhanced settings for cross-platform development
- Recommended extensions for development workflow
- Built-in tasks for common operations

**Folders Included:**
- Projects (Windows): `%USERPROFILE%\Projects`
- WSL Home: `\\wsl$\Ubuntu\home\%USERNAME%`
- WSL Projects: `\\wsl$\Ubuntu\home\%USERNAME%\projects`

### 5. Environment Variables

**Variables Set:**
- `DEV_HOME`: Points to `%USERPROFILE%\Projects`
- `PROJECTS`: Points to `%USERPROFILE%\Projects`

### 6. Desktop Shortcuts

**Location:** `%USERPROFILE%\Desktop\Dev Environment\`

**Shortcuts Created:**
- **PowerShell Projects:** Opens PowerShell in Projects directory
- **Git Bash Projects:** Opens Git Bash in Projects directory
- **VS Code Projects:** Opens VS Code with Projects directory

## How to Use

### Running the Configuration

1. **Through the App:**
   - Launch the Universal Development Environment Setup app
   - Click "Configure Terminal Paths" button
   - Follow the progress in the console output

2. **Manual Execution:**
   ```powershell
   # Run as Administrator
   .\setup-path-configs.ps1
   
   # With backup of existing configs
   .\setup-path-configs.ps1 -Backup
   
   # Force overwrite existing configs
   .\setup-path-configs.ps1 -Force
   ```

### After Configuration

1. **Restart Terminal Applications:**
   - Close all open PowerShell, Git Bash, and Windows Terminal windows
   - Open new terminals - they should now default to the Projects directory

2. **Open VS Code Workspace:**
   - Navigate to `%USERPROFILE%\Projects\`
   - Double-click `dev-workspace.code-workspace`
   - This gives you instant access to both Windows and WSL project directories

3. **Test the Configuration:**
   ```powershell
   # In PowerShell
   dev-status        # Check development environment
   cdprojects        # Should be in Projects already
   new-project test  # Create a test project
   ```

   ```bash
   # In Git Bash or WSL
   dev-status        # Check development environment
   cdprojects        # Navigate to projects
   gs                # Quick git status
   ```

## Directory Structure

After configuration, your development environment will have this structure:

```
%USERPROFILE%\
├── Projects\                          # Main development directory
│   ├── dev-workspace.code-workspace   # VS Code workspace
│   ├── dev-startup.ps1               # PowerShell startup script
│   └── [your-projects]\              # Your actual projects
├── Desktop\
│   └── Dev Environment\              # Quick access shortcuts
│       ├── PowerShell Projects.lnk
│       ├── Git Bash Projects.lnk
│       └── VS Code Projects.lnk
├── .bash_profile                     # Git Bash configuration
└── Documents\
    └── WindowsPowerShell\
        └── Microsoft.PowerShell_profile.ps1  # PowerShell profile
```

## Cross-Platform Integration

### Windows ↔ WSL Path Mapping

- **Windows Projects:** `%USERPROFILE%\Projects`
- **WSL Projects:** `$HOME/projects` (symlinked to Windows)
- **WSL Windows Access:** `/mnt/c/Users/%USERNAME%/Projects`

### Quick Navigation Commands

| Environment | Command | Destination |
|-------------|---------|-------------|
| PowerShell | `cdprojects` | `%USERPROFILE%\Projects` |
| PowerShell | `cdwsl` | `\\wsl$\Ubuntu\home\%USERNAME%` |
| PowerShell | `cdw` | `%USERPROFILE%` |
| Git Bash | `cdprojects` | `/c/Users/%USERNAME%/Projects` |
| Git Bash | `cdwin` | `%USERPROFILE%` |
| WSL | `cdprojects` | `/mnt/c/Users/$USER/Projects` |
| WSL | `cdwslprojects` | `$HOME/projects` |
| WSL | `cdwin` | `/mnt/c/Users/$USER` |

## Troubleshooting

### Configuration Not Applied

1. **Check Admin Privileges:** The configuration script needs Administrator privileges
2. **Restart Terminals:** Close and reopen all terminal applications
3. **Check PowerShell Execution Policy:**
   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Terminals Not Opening in Projects Directory

1. **Check Environment Variables:**
   ```powershell
   echo $env:PROJECTS
   echo $env:DEV_HOME
   ```

2. **Verify Profile Files:**
   - PowerShell: `Test-Path $PROFILE`
   - Git Bash: Check for `.bash_profile` in home directory

3. **Manual Profile Loading:**
   ```powershell
   # PowerShell
   . $PROFILE
   ```
   ```bash
   # Git Bash
   source ~/.bash_profile
   ```

### WSL Integration Issues

1. **Check WSL Installation:** `wsl --list --verbose`
2. **Verify WSL Path Access:** Try accessing `\\wsl$\Ubuntu\` in File Explorer
3. **WSL Configuration:** Ensure Ubuntu (or your distro) is set as default

## Advanced Configuration

### Custom Projects Directory

To use a different projects directory:

```powershell
.\setup-path-configs.ps1 -ProjectsPath "D:\Development"
```

### Backup and Restore

The script automatically creates backups when using the `-Backup` parameter:

```powershell
# Create backups before configuration
.\setup-path-configs.ps1 -Backup

# Backups are saved with timestamp:
# .bash_profile.backup.20240101-120000
# Microsoft.PowerShell_profile.ps1.backup.20240101-120000
```

### Integration with Existing Profiles

The configuration is designed to be additive - it won't overwrite your existing customizations, but will append the development environment configurations.

## Benefits

1. **Consistent Experience:** All terminals open to the same development directory
2. **Quick Navigation:** Enhanced commands for moving between environments
3. **Cross-Platform:** Seamless integration between Windows and WSL
4. **Productivity:** Faster project creation and environment management
5. **Organized Workflow:** Clear separation between personal and development files
6. **Tool Integration:** VS Code workspace with optimized settings for development

## Updates and Maintenance

The configuration can be re-run safely to update or fix any issues:

```powershell
# Update configuration
.\setup-path-configs.ps1 -Force

# Re-run through the app
# Click "Configure Terminal Paths" button again
```

This will ensure all configuration files are up-to-date with the latest enhancements and fixes. 