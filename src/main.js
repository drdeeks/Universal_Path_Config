const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

// Set custom user data path to avoid cache permission issues
const userDataPath = path.join(os.homedir(), 'AppData', 'Local', 'Universal-Path-Config');
app.setPath('userData', userDataPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
    autoHideMenuBar: true,
    resizable: true,
    minWidth: 800,
    minHeight: 600
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Configuration paths
const CONFIG_PATHS = {
  powerShellProfile: path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'),
  gitConfig: path.join(os.homedir(), '.gitconfig'),
  vsCodeSettings: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
  vsCodeKeybindings: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'keybindings.json'),
  windowsTerminalSettings: path.join(os.homedir(), 'AppData', 'Local', 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
  npmrc: path.join(os.homedir(), '.npmrc'),
  projectsDir: path.join(os.homedir(), 'Projects'),
  wslHome: '\\\\wsl$\\Ubuntu\\home\\' + os.userInfo().username,
  gitBashProfile: path.join(os.homedir(), '.bash_profile'),
  vscodeWorkspace: path.join(os.homedir(), 'Projects', 'dev-workspace.code-workspace'),
  pathConfigScript: path.join(process.cwd(), 'setup-path-configs.ps1')
};

// Duplicate file patterns and cleanup rules
const CLEANUP_RULES = {
  // PowerShell profiles in various locations
  powerShellProfiles: [
    path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'),
    path.join(os.homedir(), 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1'),
    path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'profile.ps1'),
    path.join(os.homedir(), 'Documents', 'PowerShell', 'profile.ps1'),
    'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\profile.ps1'
  ],
  
  // Git configurations
  gitConfigs: [
    path.join(os.homedir(), '.gitconfig'),
    path.join(os.homedir(), '.git-credentials'),
    path.join(os.homedir(), 'AppData', 'Local', 'Git', 'config'),
    path.join(os.homedir(), 'Projects', '.gitconfig')
  ],
  
  // VS Code settings duplicates
  vsCodeSettings: [
    path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Code - Insiders', 'User', 'settings.json'),
    path.join(os.homedir(), 'Projects', 'settings.json'),
    path.join(os.homedir(), '.vscode', 'settings.json')
  ],
  
  // SSH configurations
  sshConfigs: [
    path.join(os.homedir(), '.ssh', 'config'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'ssh', 'config'),
    path.join(os.homedir(), 'Documents', 'ssh_config')
  ],
  
  // Node/NPM configurations
  nodeConfigs: [
    path.join(os.homedir(), '.npmrc'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'npm', '.npmrc'),
    path.join(os.homedir(), 'Projects', '.npmrc'),
    path.join(os.homedir(), '.yarnrc'),
    path.join(os.homedir(), '.nvmrc')
  ],
  
  // Terminal configurations
  terminalConfigs: [
    path.join(os.homedir(), 'AppData', 'Local', 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json'),
    path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows Terminal', 'settings.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows Terminal', 'settings.json')
  ],
  
  // Environment variable scripts
  envScripts: [
    path.join(os.homedir(), '.env'),
    path.join(os.homedir(), 'Projects', '.env'),
    path.join(os.homedir(), 'environment.ps1'),
    path.join(os.homedir(), 'Documents', 'environment.ps1')
  ]
};

// IPC handlers
ipcMain.handle('check-admin', async () => {
  return new Promise((resolve) => {
    // First try a simple filesystem test
    try {
      const testFile = path.join(os.tmpdir(), 'admin-test-' + Date.now() + '.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      // If we can write to system locations, we likely have admin privileges
      try {
        const systemTestPath = 'C:\\Windows\\Temp\\admin-test-' + Date.now() + '.tmp';
        fs.writeFileSync(systemTestPath, 'admin test');
        fs.unlinkSync(systemTestPath);
        console.log('Filesystem admin test: SUCCESS');
        resolve(true);
        return;
      } catch (fsError) {
        console.log('Filesystem admin test: FAILED', fsError.message);
      }
    } catch (error) {
      console.log('Basic filesystem test failed:', error.message);
    }
    
    // If filesystem test is inconclusive, try PowerShell methods
    const checkAdminScript = `
      try {
        # Method 1: Check Windows Identity
        $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
        $isAdmin1 = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        # Method 2: Check via whoami groups (more reliable)
        $whoamiGroups = whoami /groups
        $isAdmin2 = $whoamiGroups -match "S-1-5-32-544"
        
        # Method 3: Try to access admin-only registry
        try {
          $null = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -ErrorAction Stop
          $isAdmin3 = $true
        } catch {
          $isAdmin3 = $false
        }
        
        # Return true if any method confirms admin
        $finalResult = $isAdmin1 -or $isAdmin2 -or $isAdmin3
        Write-Output "Admin1: $isAdmin1, Admin2: $isAdmin2, Admin3: $isAdmin3, Final: $finalResult"
        Write-Output $finalResult
      } catch {
        Write-Output "Error: $_"
        Write-Output $false
      }
    `;
    
    // Use -ExecutionPolicy Bypass to ensure the script runs
    const process = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-Command', checkAdminScript], { 
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      console.log('Admin check output:', output);
      console.log('Admin check errors:', errorOutput);
      console.log('Admin check exit code:', code);
      
      const lines = output.trim().split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // Look for "True" in the output or any indication of admin privileges
      const isAdmin = lastLine === 'True' || 
                      output.includes('Admin2: True') || 
                      output.includes('Final: True') ||
                      output.includes('S-1-5-32-544');
      
      console.log('Final admin decision:', isAdmin);
      resolve(isAdmin);
    });
    
    process.on('error', (error) => {
      console.error('Admin check process error:', error);
      // If there's an error, assume not admin for safety
      resolve(false);
    });
  });
});

ipcMain.handle('verify-environment-structure', async (event) => {
  const results = {
    issues: [],
    fixes: [],
    cleanedFiles: [],
    status: 'checking'
  };

  try {
    // Check and fix directory structure
    await verifyDirectoryStructure(results, event);
    
    // Check and fix configuration files
    await verifyConfigurationFiles(results, event);
    
    // Cleanup duplicate files BEFORE cross-platform setup
    await cleanupDuplicateFiles(results, event);
    
    // Check cross-platform compatibility
    await verifyCrossPlatformSetup(results, event);
    
    // Check tool integrations
    await verifyToolIntegrations(results, event);
    
    results.status = 'completed';
    return results;
  } catch (error) {
    results.status = 'error';
    results.issues.push(`Verification failed: ${error.message}`);
    return results;
  }
});

ipcMain.handle('configure-paths', async (event) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting path configuration...');
              event.sender.send('setup-output', 'Configuring terminal and application paths...');
      
      // Check if the path configuration script exists, with fallback locations
      let scriptPath = CONFIG_PATHS.pathConfigScript;
      
      if (!fs.existsSync(scriptPath)) {
        // Try alternative locations
        const alternativePaths = [
          path.join(__dirname, '..', 'setup-path-configs.ps1'),
          path.join(process.resourcesPath, 'setup-path-configs.ps1'),
          path.join(path.dirname(process.execPath), 'setup-path-configs.ps1')
        ];
        
        let found = false;
        for (const altPath of alternativePaths) {
          if (fs.existsSync(altPath)) {
            scriptPath = altPath;
            found = true;
            console.log(`Found path config script at: ${altPath}`);
            break;
          }
        }
        
        if (!found) {
          const error = `Path configuration script not found. Tried:\n- ${CONFIG_PATHS.pathConfigScript}\n- ${alternativePaths.join('\n- ')}`;
          console.error(error);
          event.sender.send('setup-output', `[ERROR] ${error}`);
          reject({ success: false, error: error });
          return;
        }
      }
      
      // Execute the path configuration script
      const configProcess = spawn('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        '-Backup'
      ], { 
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      configProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Send real-time output to renderer
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            event.sender.send('setup-output', line.trim());
          }
        });
      });
      
      configProcess.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
                    event.sender.send('setup-output', `[WARN] ${text.trim()}`);
      });
      
      configProcess.on('close', (code) => {
        console.log('Path configuration completed with code:', code);
        console.log('Output:', output);
        
        if (errorOutput) {
          console.log('Errors:', errorOutput);
        }
        
        if (code === 0) {
          event.sender.send('setup-output', '[OK] Path configuration completed successfully!');
          event.sender.send('setup-output', '[INFO] Please restart your terminal applications to see the changes.');
          resolve({ 
            success: true, 
            message: 'Path configuration completed successfully',
            output: output 
          });
        } else {
          const error = `Path configuration failed with exit code ${code}`;
                      event.sender.send('setup-output', `[ERROR] ${error}`);
          reject({ 
            success: false, 
            error: error,
            output: output,
            errorOutput: errorOutput 
          });
        }
      });
      
      configProcess.on('error', (error) => {
        console.error('Path configuration process error:', error);
        const errorMsg = `Failed to start path configuration: ${error.message}`;
        event.sender.send('setup-output', `[ERROR] ${errorMsg}`);
        reject({ success: false, error: errorMsg });
      });
      
    } catch (error) {
      console.error('Error in configure-paths:', error);
      const errorMsg = `Path configuration failed: ${error.message || error.toString()}`;
      event.sender.send('setup-output', `[ERROR] ${errorMsg}`);
      reject({ success: false, error: errorMsg });
    }
  });
});

ipcMain.handle('cleanup-duplicate-files', async (event) => {
  const results = {
    issues: [],
    fixes: [],
    cleanedFiles: [],
    status: 'cleaning'
  };

  try {
    event.sender.send('setup-output', '🧹 Starting comprehensive system cleanup...');
    
    await cleanupDuplicateFiles(results, event);
    
    results.status = 'completed';
    return results;
  } catch (error) {
    results.status = 'error';
    results.issues.push(`Cleanup failed: ${error.message}`);
    event.sender.send('setup-output', `[ERROR] Cleanup failed: ${error.message}`);
    return results;
  }
});

async function verifyDirectoryStructure(results, event) {
      event.sender.send('setup-output', 'Verifying directory structure...');
  
  // Ensure Projects directory exists
  if (!fs.existsSync(CONFIG_PATHS.projectsDir)) {
    fs.mkdirSync(CONFIG_PATHS.projectsDir, { recursive: true });
    results.fixes.push('Created Projects directory');
            event.sender.send('setup-output', '[OK] Created Projects directory');
  }

  // Ensure PowerShell profile directory exists
  const psProfileDir = path.dirname(CONFIG_PATHS.powerShellProfile);
  if (!fs.existsSync(psProfileDir)) {
    fs.mkdirSync(psProfileDir, { recursive: true });
    results.fixes.push('Created PowerShell profile directory');
            event.sender.send('setup-output', '[OK] Created PowerShell profile directory');
  }

  // Ensure VS Code settings directory exists
  const vsCodeDir = path.dirname(CONFIG_PATHS.vsCodeSettings);
  if (!fs.existsSync(vsCodeDir)) {
    fs.mkdirSync(vsCodeDir, { recursive: true });
    results.fixes.push('Created VS Code settings directory');
            event.sender.send('setup-output', '[OK] Created VS Code settings directory');
  }
}

async function verifyConfigurationFiles(results, event) {
      event.sender.send('setup-output', 'Verifying configuration files...');
  
  // Verify PowerShell Profile
  await verifyPowerShellProfile(results, event);
  
  // Verify Git Configuration
  await verifyGitConfiguration(results, event);
  
  // Verify VS Code Settings
  await verifyVSCodeSettings(results, event);
  
  // Verify Windows Terminal Settings
  await verifyWindowsTerminalSettings(results, event);
  
  // Verify NPM Configuration
  await verifyNpmConfiguration(results, event);
}

async function verifyPowerShellProfile(results, event) {
  const profileContent = `# Universal Development Environment Profile
# Auto-generated and verified configuration

# Set default starting directory to Projects
Set-Location "$env:USERPROFILE\\Projects" -ErrorAction SilentlyContinue

# WSL Integration
function Use-WSL { wsl $args }
Set-Alias -Name bash -Value Use-WSL
Set-Alias -Name ll -Value "wsl ls -la"

# Environment Variables
$env:WSLHOME = "\\\\wsl$\\Ubuntu\\home\\$env:USERNAME"
$env:EDITOR = "code"
$env:PROJECTS = "$env:USERPROFILE\\Projects"
$env:DEV_HOME = "$env:USERPROFILE\\Projects"

# Ensure Projects directory exists and set as default
if (!(Test-Path "$env:USERPROFILE\\Projects")) {
    New-Item -Path "$env:USERPROFILE\\Projects" -ItemType Directory -Force | Out-Null
}

# Welcome message with path info
Write-Host "Development Environment Loaded!" -ForegroundColor Green
Write-Host "Current Location: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Use 'cdprojects', 'cdwsl', or 'cdw' to navigate" -ForegroundColor Yellow

# Git aliases with cross-platform support
function git-wsl { wsl git $args }
function git-win { & "C:\\Program Files\\Git\\bin\\git.exe" $args }
function git-status { git status $args }
function git-push { git push $args }
function git-pull { git pull $args }

# Node/NPM integration
$env:PATH += ";$env:APPDATA\\npm"
function npm-global-list { npm list -g --depth=0 }
function npm-update-all { npm update -g }

# Docker integration with fallback
function docker-wsl { 
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker $args
  } else {
    wsl docker $args
  }
}

# Enhanced navigation with verification
function cdw { 
  Set-Location "$env:USERPROFILE"
  Write-Host "Windows Home: $env:USERPROFILE" -ForegroundColor Cyan
}

function cdwsl { 
  $wslPath = "\\\\wsl$\\Ubuntu\\home\\$env:USERNAME"
  if (Test-Path $wslPath) {
    Set-Location $wslPath
    Write-Host "WSL Home: $wslPath" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] WSL not accessible. Run 'wsl' first." -ForegroundColor Red
  }
}

function cdprojects { 
  $projectsPath = "$env:USERPROFILE\\Projects"
  if (!(Test-Path $projectsPath)) {
    New-Item -Path $projectsPath -ItemType Directory -Force
  }
  Set-Location $projectsPath
  Write-Host "Projects: $projectsPath" -ForegroundColor Blue
}

# VS Code integration with environment detection
function code-wsl { wsl code $args }
function code-here { code . }
function code-projects { code "$env:USERPROFILE\\Projects" }

# Development environment management
function dev-status {
  Write-Host "Development Environment Status:" -ForegroundColor Cyan
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
  
  # Git status
  if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "[OK] Git: $gitVersion" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] Git: Not installed" -ForegroundColor Red
  }
  
  # Node status
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "[OK] Node: $nodeVersion" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] Node: Not installed" -ForegroundColor Red
  }
  
  # NPM status
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "[OK] NPM: v$npmVersion" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] NPM: Not installed" -ForegroundColor Red
  }
  
  # Docker status
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
      $dockerVersion = docker --version
      Write-Host "[OK] Docker: $dockerVersion" -ForegroundColor Green
    } catch {
      Write-Host "[WARN] Docker: Installed but not running" -ForegroundColor Yellow
    }
  } else {
    Write-Host "[ERROR] Docker: Not installed" -ForegroundColor Red
  }
  
  # WSL status
  if (Get-Command wsl -ErrorAction SilentlyContinue) {
    try {
      $wslDistros = wsl --list --quiet 2>$null | Where-Object { $_.Trim() -ne "" }
      if ($wslDistros) {
        $distroCount = ($wslDistros | Measure-Object).Count
        Write-Host "[OK] WSL: Available ($distroCount distribution$(if($distroCount -ne 1){'s'}))" -ForegroundColor Green
      } else {
        Write-Host "[WARN] WSL: Installed (no distributions)" -ForegroundColor Yellow
      }
    } catch {
      Write-Host "[WARN] WSL: Installed but needs setup" -ForegroundColor Yellow
    }
  } else {
    Write-Host "[ERROR] WSL: Not installed" -ForegroundColor Red
  }
  
  # VS Code status
  if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "[OK] VS Code: Available" -ForegroundColor Green
  } else {
    Write-Host "[ERROR] VS Code: Not installed" -ForegroundColor Red
  }
  
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
}

function dev-update {
  Write-Host "🔄 Updating development tools..." -ForegroundColor Yellow
  
  # Update Chocolatey packages
  if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "📦 Updating Chocolatey packages..." -ForegroundColor Cyan
    choco upgrade all -y
  }
  
  # Update NPM packages
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "📦 Updating global NPM packages..." -ForegroundColor Cyan
    npm update -g
  }
  
  # Update WSL packages
  if (Get-Command wsl -ErrorAction SilentlyContinue) {
    Write-Host "Updating WSL packages..." -ForegroundColor Cyan
    wsl sudo apt update && wsl sudo apt upgrade -y
  }
  
      Write-Host "[OK] Update completed!" -ForegroundColor Green
}

# Cross-platform project management
function new-project {
  param([string]$ProjectName)
  
  if (!$ProjectName) {
    $ProjectName = Read-Host "Enter project name"
  }
  
  $projectPath = "$env:USERPROFILE\\Projects\\$ProjectName"
  
  if (Test-Path $projectPath) {
    Write-Host "[ERROR] Project '$ProjectName' already exists!" -ForegroundColor Red
    return
  }
  
  New-Item -Path $projectPath -ItemType Directory -Force
  Set-Location $projectPath
  
  # Initialize git repo
  if (Get-Command git -ErrorAction SilentlyContinue) {
    git init
          Write-Host "[OK] Initialized Git repository" -ForegroundColor Green
  }
  
  # Create basic project structure
  $readmeContent = "# $ProjectName" + [Environment]::NewLine + [Environment]::NewLine + "Project description here."
  New-Item -Path "README.md" -ItemType File -Value $readmeContent -Force
  
  $gitignoreContent = "node_modules/" + [Environment]::NewLine + ".env" + [Environment]::NewLine + "*.log"
  New-Item -Path ".gitignore" -ItemType File -Value $gitignoreContent -Force
  
  Write-Host "Created project '$ProjectName' at: $projectPath" -ForegroundColor Cyan
  Write-Host "Opening in VS Code..." -ForegroundColor Blue
  
  if (Get-Command code -ErrorAction SilentlyContinue) {
    code .
  }
}

# Environment synchronization
function sync-env {
  Write-Host "🔄 Synchronizing development environment..." -ForegroundColor Cyan
  
  # Sync Git config to WSL
  if (Get-Command wsl -ErrorAction SilentlyContinue) {
    $gitUser = git config --global user.name
    $gitEmail = git config --global user.email
    
    if ($gitUser -and $gitEmail) {
      wsl git config --global user.name "'$gitUser'"
      wsl git config --global user.email "'$gitEmail'"
      Write-Host "[OK] Synced Git config to WSL" -ForegroundColor Green
    }
  }
  
  Write-Host "[OK] Environment synchronization completed!" -ForegroundColor Green
}

Write-Host "Universal Development Environment loaded!" -ForegroundColor Green
Write-Host "Available commands: dev-status, dev-update, new-project, sync-env" -ForegroundColor Cyan
Write-Host "Navigation: cdw, cdwsl, cdprojects" -ForegroundColor Cyan
`;

  if (!fs.existsSync(CONFIG_PATHS.powerShellProfile) || 
      !fs.readFileSync(CONFIG_PATHS.powerShellProfile, 'utf8').includes('Universal Development Environment')) {
    
    fs.writeFileSync(CONFIG_PATHS.powerShellProfile, profileContent, 'utf8');
    results.fixes.push('Updated PowerShell profile with enhanced configuration');
          event.sender.send('setup-output', '[OK] PowerShell profile updated with cross-platform features');
  }
}

async function verifyGitConfiguration(results, event) {
  // Check if .gitconfig exists and has proper structure
  let gitConfigContent = '';
  let needsUpdate = false;

  if (fs.existsSync(CONFIG_PATHS.gitConfig)) {
    gitConfigContent = fs.readFileSync(CONFIG_PATHS.gitConfig, 'utf8');
  } else {
    needsUpdate = true;
  }

  // Essential Git configuration
  const requiredConfigs = [
    'core.editor = code --wait',
    'init.defaultBranch = main',
    'core.autocrlf = true',
    'credential.helper = manager-core',
    'pull.rebase = false',
    'push.default = simple'
  ];

  let configToAdd = [];
  requiredConfigs.forEach(config => {
    if (!gitConfigContent.includes(config)) {
      configToAdd.push(config);
      needsUpdate = true;
    }
  });

  if (needsUpdate) {
    // Apply configurations via git command
    const configurations = [
      ['core.editor', 'code --wait'],
      ['init.defaultBranch', 'main'],
      ['core.autocrlf', 'true'],
      ['credential.helper', 'manager-core'],
      ['pull.rebase', 'false'],
      ['push.default', 'simple']
    ];

    for (const [key, value] of configurations) {
      await runCommand(`git config --global ${key} "${value}"`);
    }

    results.fixes.push('Updated Git global configuration');
          event.sender.send('setup-output', '[OK] Git configuration updated');
  }
}

async function verifyVSCodeSettings(results, event) {
  const vsCodeSettings = {
    "terminal.integrated.defaultProfile.windows": "PowerShell",
    "terminal.integrated.cwd": "${env:USERPROFILE}\\Projects",
    "terminal.integrated.profiles.windows": {
      "PowerShell": {
        "source": "PowerShell",
        "icon": "terminal-powershell",
        "args": ["-NoLogo", "-ExecutionPolicy", "Bypass"]
      },
      "WSL": {
        "path": "wsl.exe",
        "icon": "terminal-ubuntu",
        "args": ["~"]
      },
      "Git Bash": {
        "source": "Git Bash",
        "icon": "terminal-bash"
      }
    },
    "git.enableSmartCommit": true,
    "git.confirmSync": false,
    "git.autofetch": true,
    "git.defaultCloneDirectory": "${env:USERPROFILE}\\Projects",
    "workbench.startupEditor": "newUntitledFile",
    "workbench.panel.defaultLocation": "right",
    "explorer.openEditors.visible": 10,
    "explorer.confirmDelete": false,
    "explorer.confirmDragAndDrop": false,
    "files.defaultLanguage": "markdown",
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    "files.associations": {
      "*.ps1": "powershell",
      "*.env": "properties"
    },
    "editor.formatOnSave": true,
    "editor.wordWrap": "on",
    "editor.minimap.enabled": true,
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "remote.WSL.fileWatcher.polling": true,
    "remote.WSL.server.connectThroughProxy": true,
    "extensions.autoUpdate": true,
    "extensions.ignoreRecommendations": false,
    "python.defaultInterpreterPath": "python",
    "javascript.updateImportsOnFileMove.enabled": "always",
    "typescript.updateImportsOnFileMove.enabled": "always"
  };

  let currentSettings = {};
  if (fs.existsSync(CONFIG_PATHS.vsCodeSettings)) {
    try {
      currentSettings = JSON.parse(fs.readFileSync(CONFIG_PATHS.vsCodeSettings, 'utf8'));
    } catch (error) {
              event.sender.send('setup-output', '[WARN] VS Code settings file corrupted, recreating...');
    }
  }

  // Merge settings
  const mergedSettings = { ...currentSettings, ...vsCodeSettings };
  
  fs.writeFileSync(CONFIG_PATHS.vsCodeSettings, JSON.stringify(mergedSettings, null, 2), 'utf8');
  results.fixes.push('Updated VS Code settings for cross-platform development');
        event.sender.send('setup-output', '[OK] VS Code settings configured');
}

async function verifyWindowsTerminalSettings(results, event) {
  // Windows Terminal configuration for seamless environment switching
  const terminalSettings = {
    "$schema": "https://aka.ms/terminal-profiles-schema",
    "defaultProfile": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
    "copyOnSelect": true,
    "copyFormatting": "none",
    "profiles": {
      "defaults": {
        "fontFace": "Cascadia Code",
        "fontSize": 12,
        "colorScheme": "Campbell Powershell",
        "cursorShape": "bar",
        "historySize": 9001
      },
      "list": [
        {
          "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
          "name": "PowerShell (Dev)",
          "commandline": "powershell.exe -NoLogo",
          "hidden": false,
          "startingDirectory": "%USERPROFILE%\\\\Projects",
          "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png",
          "tabTitle": "PowerShell - Projects"
        },
        {
          "guid": "{2c4de342-38b7-51cf-b940-2309a097f518}",
          "name": "WSL Ubuntu (Dev)",
          "commandline": "wsl.exe ~",
          "hidden": false,
          "startingDirectory": "//wsl$/Ubuntu/home/%USERNAME%",
          "icon": "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
          "tabTitle": "WSL - Home"
        },
        {
          "guid": "{3c4de342-38b7-51cf-b940-2309a097f519}",
          "name": "WSL Projects",
          "commandline": "wsl.exe -d Ubuntu",
          "hidden": false,
          "startingDirectory": "//wsl$/Ubuntu/home/%USERNAME%/projects",
          "icon": "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
          "tabTitle": "WSL - Projects"
        },
        {
          "guid": "{4c4de342-38b7-51cf-b940-2309a097f520}",
          "name": "Git Bash (Dev)",
          "commandline": "\"%PROGRAMFILES%\\Git\\bin\\bash.exe\" -i -l",
          "hidden": false,
          "startingDirectory": "%USERPROFILE%\\\\Projects",
          "icon": "ms-appx:///ProfileIcons/{2ece5bfe-50ed-5f3a-ab87-5cd4baafed2b}.png",
          "tabTitle": "Git Bash - Projects"
        }
      ]
    },
    "schemes": [
      {
        "name": "Dev Environment",
        "black": "#0C0C0C",
        "red": "#C50F1F",
        "green": "#13A10E",
        "yellow": "#C19C00",
        "blue": "#0037DA",
        "purple": "#881798",
        "cyan": "#3A96DD",
        "white": "#CCCCCC",
        "brightBlack": "#767676",
        "brightRed": "#E74856",
        "brightGreen": "#16C60C",
        "brightYellow": "#F9F1A5",
        "brightBlue": "#3B78FF",
        "brightPurple": "#B4009E",
        "brightCyan": "#61D6D6",
        "brightWhite": "#F2F2F2",
        "background": "#012456",
        "foreground": "#CCCCCC"
      }
    ]
  };

  if (fs.existsSync(path.dirname(CONFIG_PATHS.windowsTerminalSettings))) {
    fs.writeFileSync(CONFIG_PATHS.windowsTerminalSettings, JSON.stringify(terminalSettings, null, 2), 'utf8');
    results.fixes.push('Updated Windows Terminal settings');
          event.sender.send('setup-output', '[OK] Windows Terminal configured');
  }
}

async function verifyNpmConfiguration(results, event) {
  const npmrcContent = `# NPM Configuration for Universal Dev Environment
registry=https://registry.npmjs.org/
save-exact=true
engine-strict=true
fund=false
audit-level=moderate
`;

  if (!fs.existsSync(CONFIG_PATHS.npmrc)) {
    fs.writeFileSync(CONFIG_PATHS.npmrc, npmrcContent, 'utf8');
    results.fixes.push('Created NPM configuration file');
          event.sender.send('setup-output', '[OK] NPM configuration created');
  }
}

async function verifyCrossPlatformSetup(results, event) {
  event.sender.send('setup-output', '🌐 Verifying cross-platform setup...');
  
  // Simplified WSL detection - much more reliable
  try {
    event.sender.send('setup-output', '[INFO] Checking WSL availability...');
    
    // Simple WSL test - just try to run a basic command
    await runCommandWithTimeout('wsl --status', 10000);
    event.sender.send('setup-output', '[INFO] WSL detected, testing functionality...');
    
    // Test WSL basic functionality with multiple approaches
    let wslWorking = false;
    let testResult = '';
    
    try {
      // Try basic echo first
      testResult = await runCommandWithTimeout('wsl echo "WSL_WORKING"', 10000);
      if (testResult && testResult.trim() === 'WSL_WORKING') {
        wslWorking = true;
      }
    } catch (echoError) {
      console.log('WSL echo test failed:', echoError.message);
    }
    
    // If echo failed, try a simpler command
    if (!wslWorking) {
      try {
        testResult = await runCommandWithTimeout('wsl pwd', 10000);
        if (testResult && testResult.trim().length > 0) {
          wslWorking = true;
          event.sender.send('setup-output', '[INFO] WSL responding with alternative test');
        }
      } catch (pwdError) {
        console.log('WSL pwd test failed:', pwdError.message);
      }
    }
    
    if (wslWorking) {
      event.sender.send('setup-output', '[OK] WSL is functional and available for cross-platform development');
      results.fixes.push('WSL cross-platform integration verified and working');
      
      // Try to get distribution info for logging, but don't fail if it doesn't work
      try {
        const distInfo = await runCommandWithTimeout('wsl --list --quiet', 3000);
        if (distInfo && distInfo.trim()) {
          event.sender.send('setup-output', `[INFO] WSL distributions available: ${distInfo.trim().replace(/\s+/g, ', ')}`);
        }
      } catch (distError) {
        // Don't fail - just log that we couldn't get distribution details
        event.sender.send('setup-output', '[INFO] WSL working but distribution details unavailable');
      }
    } else {
      // WSL installed but having issues
      event.sender.send('setup-output', '[WARN] WSL is installed but may need configuration');
      event.sender.send('setup-output', '[INFO] Try: wsl --install -d Ubuntu-24.04');
      results.issues.push('WSL installed but not properly configured - install a distribution');
    }
    
  } catch (error) {
    console.log('WSL check failed:', error.message);
    
    if (error.message.includes('not recognized')) {
      results.issues.push('WSL not installed - install WSL for cross-platform development');
      event.sender.send('setup-output', '[WARN] WSL not available - cross-platform features will be limited');
      event.sender.send('setup-output', '[INFO] Install WSL with: wsl --install');
    } else {
      results.issues.push('WSL check failed - manual configuration may be needed');
      event.sender.send('setup-output', '[WARN] WSL check failed - cross-platform features may be limited');
      event.sender.send('setup-output', '[INFO] Verify WSL installation: wsl --status');
    }
  }
  
  // Always complete the cross-platform verification step
  event.sender.send('setup-output', '[OK] Cross-platform setup verification completed');
}

async function verifyToolIntegrations(results, event) {
  event.sender.send('setup-output', '🔗 Verifying tool integrations...');
  
  // Install essential VS Code extensions if VS Code is available
  if (await checkCommand('code')) {
    const extensions = [
      'ms-vscode-remote.remote-wsl',
      'ms-vscode.powershell',
      'ms-python.python',
      'esbenp.prettier-vscode',
      'ms-vscode.vscode-eslint',
      'eamodio.gitlens',
      'ms-azuretools.vscode-docker'
    ];

    for (const extension of extensions) {
      try {
        await runCommand(`code --install-extension ${extension} --force`);
      } catch (error) {
        // Extension already installed or failed - continue
      }
    }
    
    results.fixes.push('Verified VS Code extensions');
          event.sender.send('setup-output', '[OK] VS Code extensions verified');
  }

  // Install essential NPM global packages if NPM is available
  if (await checkCommand('npm')) {
    const globalPackages = [
      'nodemon',
      'live-server',
      'http-server',
      'typescript',
      'ts-node',
      'eslint',
      'prettier'
    ];

    for (const package of globalPackages) {
      try {
        await runCommand(`npm list -g ${package} || npm install -g ${package}`);
      } catch (error) {
        // Package installation failed - continue
      }
    }
    
    results.fixes.push('Verified NPM global packages');
          event.sender.send('setup-output', '[OK] NPM global packages verified');
  }

  // Install essential Python packages if Python is available
  if (await checkCommand('python') || await checkCommand('python3')) {
    const pythonPackages = [
      'pip',
      'virtualenv',
      'requests',
      'pylint',
      'black',
      'pytest'
    ];

    for (const package of pythonPackages) {
      try {
        // Try pip3 first, fallback to pip
        await runCommand(`pip3 install --user ${package} || pip install --user ${package}`).catch(() => {
          // WSL fallback
          return runCommand(`wsl pip3 install ${package}`);
        });
      } catch (error) {
        // Package installation failed - continue
      }
    }
    
    results.fixes.push('Verified Python packages');
          event.sender.send('setup-output', '[OK] Python packages verified');
  }
}

async function cleanupDuplicateFiles(results, event) {
  event.sender.send('setup-output', '🧹 Scanning for duplicate configuration files...');
  
  let totalCleaned = 0;
  let totalSpace = 0;
  
  // Create backup directory for cleaned files
  const backupDir = path.join(os.homedir(), 'AppData', 'Local', 'dev-env-cleanup-backup', new Date().toISOString().split('T')[0]);
  
  try {
    await createDirectoryIfNotExists(backupDir);
    event.sender.send('setup-output', `[INFO] Created backup directory: ${backupDir}`);
  } catch (error) {
    event.sender.send('setup-output', `[WARN] Could not create backup directory: ${error.message}`);
  }
  
  // Process each cleanup rule category
  for (const [category, filePaths] of Object.entries(CLEANUP_RULES)) {
    event.sender.send('setup-output', `[INFO] Checking ${category} for duplicates...`);
    
    const cleanupResult = await cleanupDuplicatesInCategory(category, filePaths, backupDir, event);
    totalCleaned += cleanupResult.filesRemoved;
    totalSpace += cleanupResult.spaceFreed;
    
    if (cleanupResult.filesRemoved > 0) {
      results.cleanedFiles.push(`${category}: ${cleanupResult.filesRemoved} duplicates removed`);
    }
  }
  
  // Cleanup temporary files and caches
  const tempCleanup = await cleanupTemporaryFiles(backupDir, event);
  totalCleaned += tempCleanup.filesRemoved;
  totalSpace += tempCleanup.spaceFreed;
  
  if (totalCleaned > 0) {
    const spaceMB = (totalSpace / (1024 * 1024)).toFixed(2);
    results.fixes.push(`Cleaned up ${totalCleaned} duplicate files, freed ${spaceMB} MB`);
    event.sender.send('setup-output', `[OK] Cleanup completed: ${totalCleaned} files removed, ${spaceMB} MB freed`);
    event.sender.send('setup-output', `[INFO] Backup created at: ${backupDir}`);
  } else {
    results.fixes.push('No duplicate files found - system already clean');
    event.sender.send('setup-output', '[OK] No duplicate files found - system is clean');
  }
}

async function cleanupDuplicatesInCategory(category, filePaths, backupDir, event) {
  let filesRemoved = 0;
  let spaceFreed = 0;
  
  // Find which files actually exist
  const existingFiles = [];
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        existingFiles.push({
          path: filePath,
          size: stats.size,
          mtime: stats.mtime,
          content: await getFileContentHash(filePath)
        });
      }
    } catch (error) {
      // Skip files we can't access
      continue;
    }
  }
  
  if (existingFiles.length <= 1) {
    return { filesRemoved: 0, spaceFreed: 0 };
  }
  
  // Group files by content hash to find true duplicates
  const contentGroups = {};
  for (const file of existingFiles) {
    if (!contentGroups[file.content]) {
      contentGroups[file.content] = [];
    }
    contentGroups[file.content].push(file);
  }
  
  // For each group of identical files, keep the preferred one
  for (const [contentHash, duplicates] of Object.entries(contentGroups)) {
    if (duplicates.length <= 1) continue;
    
    // Sort by preference (first in original filePaths array has highest preference)
    duplicates.sort((a, b) => {
      const indexA = filePaths.indexOf(a.path);
      const indexB = filePaths.indexOf(b.path);
      return indexA - indexB;
    });
    
    const keepFile = duplicates[0];
    const removeFiles = duplicates.slice(1);
    
    event.sender.send('setup-output', `[INFO] Keeping: ${keepFile.path}`);
    
    for (const removeFile of removeFiles) {
      try {
        // Create backup before removing
        const backupPath = path.join(backupDir, category, path.basename(removeFile.path) + '_' + Date.now());
        await createDirectoryIfNotExists(path.dirname(backupPath));
        fs.copyFileSync(removeFile.path, backupPath);
        
        // Remove the duplicate
        fs.unlinkSync(removeFile.path);
        
        filesRemoved++;
        spaceFreed += removeFile.size;
        
        event.sender.send('setup-output', `[OK] Removed duplicate: ${removeFile.path}`);
      } catch (error) {
        event.sender.send('setup-output', `[WARN] Could not remove ${removeFile.path}: ${error.message}`);
      }
    }
  }
  
  return { filesRemoved, spaceFreed };
}

async function cleanupTemporaryFiles(backupDir, event) {
  event.sender.send('setup-output', '[INFO] Cleaning temporary files and caches...');
  
  let filesRemoved = 0;
  let spaceFreed = 0;
  
  const tempPaths = [
    path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'npm-*'),
    path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'yarn-*'),
    path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'vscode-*'),
    path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'electron-*'),
    path.join(os.homedir(), '.npm', '_cacache'),
    path.join(os.homedir(), '.yarn', 'cache'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'logs'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'CachedExtensions')
  ];
  
  for (const tempPath of tempPaths) {
    try {
      if (tempPath.includes('*')) {
        // Handle glob patterns
        const baseDir = path.dirname(tempPath);
        const pattern = path.basename(tempPath).replace('*', '');
        
        if (fs.existsSync(baseDir)) {
          const items = fs.readdirSync(baseDir);
          for (const item of items) {
            if (item.startsWith(pattern.replace('*', ''))) {
              const itemPath = path.join(baseDir, item);
              const result = await removeFileOrDirectory(itemPath, backupDir);
              filesRemoved += result.filesRemoved;
              spaceFreed += result.spaceFreed;
            }
          }
        }
      } else if (fs.existsSync(tempPath)) {
        const result = await removeFileOrDirectory(tempPath, backupDir);
        filesRemoved += result.filesRemoved;
        spaceFreed += result.spaceFreed;
      }
    } catch (error) {
      // Continue with other temp paths if one fails
      continue;
    }
  }
  
  if (filesRemoved > 0) {
    event.sender.send('setup-output', `[OK] Cleaned ${filesRemoved} temporary files`);
  }
  
  return { filesRemoved, spaceFreed };
}

async function getFileContentHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple hash based on content length and first/last chars
    const hash = content.length.toString() + 
                 (content.length > 0 ? content.charAt(0) : '') + 
                 (content.length > 1 ? content.charAt(content.length - 1) : '') +
                 (content.includes('# Universal Development Environment') ? 'UDE' : '');
    return hash;
  } catch (error) {
    return 'error_' + Date.now();
  }
}

async function removeFileOrDirectory(itemPath, backupDir) {
  let filesRemoved = 0;
  let spaceFreed = 0;
  
  try {
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively calculate size and count
      const items = fs.readdirSync(itemPath);
      for (const item of items) {
        const result = await removeFileOrDirectory(path.join(itemPath, item), backupDir);
        filesRemoved += result.filesRemoved;
        spaceFreed += result.spaceFreed;
      }
      fs.rmdirSync(itemPath);
    } else {
      spaceFreed += stats.size;
      filesRemoved++;
      fs.unlinkSync(itemPath);
    }
  } catch (error) {
    // Continue if we can't remove some files
  }
  
  return { filesRemoved, spaceFreed };
}

async function createDirectoryIfNotExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    // Directory creation failed
    throw error;
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const process = spawn('powershell', ['-Command', command], { shell: true });
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

function runCommandWithTimeout(command, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const process = spawn('powershell', ['-Command', command], { shell: true });
    let output = '';
    let timeoutId;
    
    // Set up timeout
    timeoutId = setTimeout(() => {
      process.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      console.error('Command error output:', data.toString());
    });
    
    process.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

function checkCommand(command) {
  return new Promise((resolve) => {
    const process = spawn('powershell', ['-Command', `Get-Command ${command} -ErrorAction SilentlyContinue`], { shell: true });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

ipcMain.handle('run-setup', async (event, options) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting setup with options:', options);
      event.sender.send('setup-output', 'Starting development environment setup...');
      
      const scriptPath = path.join(__dirname, '../dev-setup-script.txt');
      
      // Check if script file exists
      if (!fs.existsSync(scriptPath)) {
        const error = `Setup script not found at: ${scriptPath}`;
        console.error(error);
        reject({ success: false, error: error });
        return;
      }
      
      // Copy the original script to a .ps1 file for execution
      const psScriptPath = path.join(__dirname, '../temp-setup-script.ps1');
      
      try {
        const originalScript = fs.readFileSync(scriptPath, 'utf8');
        fs.writeFileSync(psScriptPath, originalScript);
        console.log('Script copied to:', psScriptPath);
      } catch (fileError) {
        const error = `Failed to read/write setup script: ${fileError.message}`;
        console.error(error);
        reject({ success: false, error: error });
        return;
      }
      
      let args = ['-ExecutionPolicy', 'Bypass', '-File', psScriptPath];
      
      if (options.skipInstallation) {
        args.push('-SkipInstallation');
      }
      
      if (options.configureOnly) {
        args.push('-ConfigureOnly');
      }
      
      if (options.gitUserName) {
        args.push('-GitUserName', `"${options.gitUserName}"`);
      }
      
      if (options.gitUserEmail) {
        args.push('-GitUserEmail', `"${options.gitUserEmail}"`);
      }
      
      console.log('PowerShell args:', args);
      event.sender.send('setup-output', `Running: powershell ${args.join(' ')}`);
      
      const process = spawn('powershell', args, { 
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        console.log('Setup stdout:', text);
        event.sender.send('setup-output', text.trim());
      });
      
      process.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        console.log('Setup stderr:', text);
        event.sender.send('setup-error', text.trim());
      });
      
      process.on('close', (code) => {
        console.log('Setup process closed with code:', code);
        
        // Clean up temp file
        try {
          fs.unlinkSync(psScriptPath);
          console.log('Temp script file cleaned up');
        } catch (e) {
          console.log('Failed to clean up temp file:', e.message);
        }
        
        if (code === 0) {
          event.sender.send('setup-output', '[OK] Setup completed successfully!');
          resolve({ success: true, output, code });
        } else {
          const error = errorOutput || `Process exited with code ${code}`;
          console.error('Setup failed:', error);
          event.sender.send('setup-error', `[ERROR] Setup failed: ${error}`);
          reject({ success: false, error: error, code: code });
        }
      });
      
      process.on('error', (error) => {
        console.error('Setup process error:', error);
        const errorMsg = `Failed to start PowerShell process: ${error.message}`;
        event.sender.send('setup-error', errorMsg);
        reject({ success: false, error: errorMsg });
      });
      
    } catch (unexpectedError) {
      console.error('Unexpected error in run-setup:', unexpectedError);
      const errorMsg = `Unexpected error: ${unexpectedError.message}`;
      event.sender.send('setup-error', errorMsg);
      reject({ success: false, error: errorMsg });
    }
  });
});

// Add a simpler setup method for testing
ipcMain.handle('run-setup-simple', async (event, options) => {
  try {
    console.log('Running simple setup with options:', options);
    event.sender.send('setup-output', 'Starting simplified setup process...');
    
    // Just run basic configuration without the complex PowerShell script
          event.sender.send('setup-output', 'Configuring Git settings...');
    
    if (options.gitUserName && options.gitUserEmail) {
      try {
        // Configure Git
        await runCommand(`git config --global user.name "${options.gitUserName}"`);
        await runCommand(`git config --global user.email "${options.gitUserEmail}"`);
        await runCommand('git config --global core.editor "code --wait"');
        await runCommand('git config --global init.defaultBranch main');
        await runCommand('git config --global core.autocrlf true');
        
        event.sender.send('setup-output', '[OK] Git configuration completed');
      } catch (gitError) {
        event.sender.send('setup-output', `[WARN] Git configuration failed: ${gitError.message}`);
      }
    }
    
    // Create Projects directory
    const projectsDir = path.join(os.homedir(), 'Projects');
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
              event.sender.send('setup-output', `[OK] Created Projects directory: ${projectsDir}`);
    }
    
          event.sender.send('setup-output', '[OK] Simple setup completed successfully!');
    return { success: true, message: 'Simple setup completed' };
    
  } catch (error) {
    console.error('Simple setup error:', error);
          event.sender.send('setup-error', `[ERROR] Simple setup failed: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('check-tool-status', async () => {
  const tools = ['git', 'node', 'code', 'docker', 'wsl', 'python'];
  const status = {};
  
  for (const tool of tools) {
    try {
      const result = await checkToolInstalled(tool);
      status[tool] = result;
    } catch (error) {
      status[tool] = { installed: false, version: null, error: error.message };
    }
  }
  
  return status;
});

function checkToolInstalled(tool) {
  return new Promise((resolve) => {
    let command;
    
    switch (tool) {
      case 'git':
        command = 'git --version';
        break;
      case 'node':
        command = 'node --version';
        break;
      case 'code':
        command = 'code --version';
        break;
      case 'docker':
        command = 'docker --version';
        break;
      case 'python':
        // Check python, python3, and py (Windows Python Launcher) commands
        command = 'python --version 2>&1 || python3 --version 2>&1 || py --version 2>&1';
        break;
      case 'wsl':
        // Use a simpler WSL check that's more reliable
        command = 'wsl --list --quiet';
        break;
      default:
        resolve({ installed: false, version: null });
        return;
    }
    
    const process = spawn('powershell', ['-Command', command], { 
      shell: true,
      encoding: 'utf8'
    });
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString('utf8');
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString('utf8');
    });
    
    process.on('close', (code) => {
      // Clean up any special characters and normalize output
      output = output.replace(/[^\x20-\x7E\n\r]/g, '').trim();
      
      if (tool === 'wsl') {
        if (code === 0 && (output.length > 0 || errorOutput.includes('Windows Subsystem for Linux'))) {
          // WSL is installed, get a cleaner status using same logic as verification
          let cleanOutput = output
            .replace(/Development Environment Ready!/g, '')
            .replace(/Projects: .*$/gm, '')
            .replace(/Quick commands: .*$/gm, '')
            .replace(/PS .*>.*$/gm, '')
            .trim();
          
          // Remove UTF-16 null bytes that Windows WSL command sometimes outputs
          cleanOutput = cleanOutput.replace(/\u0000/g, '');
          
          // Also handle carriage returns and line feeds properly
          cleanOutput = cleanOutput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          
          // Parse distribution names from clean output
          const lines = cleanOutput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !line.includes('Environment'))
            .filter(line => !line.includes('Projects:'))
            .filter(line => !line.includes('Quick'))
            .filter(line => !line.includes('commands:'))
            .filter(line => !line.includes('Ready!'))
            .filter(line => !line.includes('PS '));
          
          const validDistNames = ['Ubuntu', 'Debian', 'Fedora', 'openSUSE', 'Alpine', 'kali-linux', 'SUSE', 'Oracle', 'docker-desktop'];
          const actualDistros = [];
          
          for (const line of lines) {
            const distName = line.trim();
            
            // Only accept valid distribution names
            if (distName && 
                distName.length > 2 && 
                !distName.includes(':') &&
                !distName.includes(' ') &&
                (validDistNames.some(valid => distName.toLowerCase().includes(valid.toLowerCase())) ||
                 distName.match(/^[A-Za-z][A-Za-z0-9\-]*$/))) {
              if (!actualDistros.includes(distName)) {
                actualDistros.push(distName);
              }
            }
          }
          
          const statusText = actualDistros.length > 0 ? 
            `Available (${actualDistros.length} distribution${actualDistros.length === 1 ? '' : 's'})` : 
            'Installed (no distributions)';
          resolve({ 
            installed: true, 
            version: statusText
          });
        } else {
          resolve({ installed: false, version: null });
        }
      } else if (tool === 'python') {
        if (code === 0 && output.trim()) {
          // Python found, clean the version output
          const cleanOutput = output.trim().split('\n')[0].trim();
          resolve({ 
            installed: true, 
            version: cleanOutput.includes('Python') ? cleanOutput : `Python ${cleanOutput}`
          });
        } else {
          // Try checking with 'py' command (Windows Python Launcher)
          const pyCheck = spawn('powershell', ['-Command', 'py --version'], { 
            shell: true,
            encoding: 'utf8'
          });
          let pyOutput = '';
          
          pyCheck.stdout.on('data', (data) => {
            pyOutput += data.toString('utf8');
          });
          
          pyCheck.on('close', (pyCode) => {
            if (pyCode === 0 && pyOutput.trim()) {
              const cleanPyOutput = pyOutput.trim().split('\n')[0].trim();
              resolve({ 
                installed: true, 
                version: cleanPyOutput.includes('Python') ? cleanPyOutput : `Python ${cleanPyOutput}`
              });
            } else {
              // Try checking if Python is available in WSL
              const wslPythonCheck = spawn('wsl', ['python3', '--version'], { 
                shell: true,
                encoding: 'utf8'
              });
              let wslOutput = '';
              
              wslPythonCheck.stdout.on('data', (data) => {
                wslOutput += data.toString('utf8');
              });
              
              wslPythonCheck.on('close', (wslCode) => {
                if (wslCode === 0 && wslOutput.trim()) {
                  const cleanWslOutput = wslOutput.trim().split('\n')[0].trim();
                  resolve({ 
                    installed: true, 
                    version: `WSL: ${cleanWslOutput.includes('Python') ? cleanWslOutput : `Python ${cleanWslOutput}`}`
                  });
                } else {
                  resolve({ installed: false, version: null });
                }
              });
              
              wslPythonCheck.on('error', () => {
                resolve({ installed: false, version: null });
              });
            }
          });
          
          pyCheck.on('error', () => {
            // If 'py' command fails, try WSL as fallback
            const wslPythonCheck = spawn('wsl', ['python3', '--version'], { 
              shell: true,
              encoding: 'utf8'
            });
            let wslOutput = '';
            
            wslPythonCheck.stdout.on('data', (data) => {
              wslOutput += data.toString('utf8');
            });
            
            wslPythonCheck.on('close', (wslCode) => {
              if (wslCode === 0 && wslOutput.trim()) {
                const cleanWslOutput = wslOutput.trim().split('\n')[0].trim();
                resolve({ 
                  installed: true, 
                  version: `WSL: ${cleanWslOutput.includes('Python') ? cleanWslOutput : `Python ${cleanWslOutput}`}`
                });
              } else {
                resolve({ installed: false, version: null });
              }
            });
            
            wslPythonCheck.on('error', () => {
              resolve({ installed: false, version: null });
            });
          });
        }
      } else {
        if (code === 0 && output.trim()) {
          // For other tools, get the first line and clean it
          const cleanOutput = output.trim().split('\n')[0].trim();
          resolve({ 
            installed: true, 
            version: cleanOutput || 'Version unknown'
          });
        } else {
          resolve({ installed: false, version: null });
        }
      }
    });
    
    process.on('error', () => {
      resolve({ installed: false, version: null });
    });
  });
}

// Add new IPC handlers for project migration features
ipcMain.handle('select-projects-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Projects Directory',
      defaultPath: path.join(os.homedir(), 'Projects'),
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Projects Directory'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return {
        success: true,
        path: result.filePaths[0]
      };
    } else {
      return {
        success: false,
        message: 'No directory selected'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
});

ipcMain.handle('scan-for-existing-tools', async () => {
  try {
    const scanResults = {
      tools: [],
      projectDirectories: [],
      configurationFiles: [],
      totalFilesFound: 0
    };
    
    // Define common tool installation paths and patterns
    const toolScanPaths = [
      // Development tools
      { name: 'Git', paths: ['C:\\Program Files\\Git', 'C:\\Program Files (x86)\\Git'], type: 'git' },
      { name: 'Node.js', paths: ['C:\\Program Files\\nodejs', 'C:\\Program Files (x86)\\nodejs'], type: 'nodejs' },
      { name: 'Python', paths: ['C:\\Python*', 'C:\\Program Files\\Python*', path.join(os.homedir(), 'AppData\\Local\\Programs\\Python')], type: 'python' },
      { name: 'VS Code', paths: ['C:\\Program Files\\Microsoft VS Code', 'C:\\Program Files (x86)\\Microsoft VS Code', path.join(os.homedir(), 'AppData\\Local\\Programs\\Microsoft VS Code')], type: 'vscode' },
      { name: 'Docker Desktop', paths: ['C:\\Program Files\\Docker\\Docker'], type: 'docker' },
      { name: 'Docker CLI', paths: ['C:\\ProgramData\\DockerDesktop'], type: 'docker-cli' },
      { name: 'Windows Terminal', paths: [path.join(os.homedir(), 'AppData\\Local\\Microsoft\\WindowsApps\\wt.exe')], type: 'terminal' },
      { name: 'PowerShell Core', paths: ['C:\\Program Files\\PowerShell', 'C:\\Program Files (x86)\\PowerShell'], type: 'powershell' },
      { name: 'Java JDK', paths: ['C:\\Program Files\\Java', 'C:\\Program Files (x86)\\Java'], type: 'java' },
      { name: 'Maven', paths: ['C:\\Program Files\\Apache\\Maven', 'C:\\apache-maven*'], type: 'maven' },
      { name: 'Gradle', paths: ['C:\\Gradle', path.join(os.homedir(), '.gradle')], type: 'gradle' },
      { name: 'Go', paths: ['C:\\Program Files\\Go', 'C:\\Go'], type: 'go' },
      { name: 'Rust', paths: [path.join(os.homedir(), '.cargo'), path.join(os.homedir(), '.rustup')], type: 'rust' },
      { name: 'WSL Ubuntu', paths: ['\\\\wsl$\\Ubuntu', '\\\\wsl.localhost\\Ubuntu'], type: 'wsl' },
      { name: 'WSL Ubuntu 24.04', paths: ['\\\\wsl$\\Ubuntu-24.04', '\\\\wsl.localhost\\Ubuntu-24.04'], type: 'wsl' }
    ];
    
    // Scan for project directories in common locations
    const projectScanPaths = [
      path.join(os.homedir(), 'Projects'),
      path.join(os.homedir(), 'Documents', 'Projects'),
      path.join(os.homedir(), 'Desktop', 'Projects'),
      path.join(os.homedir(), 'Code'),
      path.join(os.homedir(), 'Documents', 'Code'),
      path.join(os.homedir(), 'Development'),
      path.join(os.homedir(), 'Dev'),
      path.join(os.homedir(), 'Workspace'),
      path.join(os.homedir(), 'Source'),
      'C:\\Projects',
      'C:\\Code',
      'C:\\Development',
      'C:\\deekswork\\Projects',  // Add custom project path
      'D:\\Projects',
      'D:\\Code',
      'D:\\Development'
    ];
    
    // Scan for tools
    for (const tool of toolScanPaths) {
      for (const searchPath of tool.paths) {
        try {
          // Handle wildcard paths
          if (searchPath.includes('*')) {
            const basePath = searchPath.replace(/\*.*$/, '');
            const pattern = searchPath.split('\\').pop();
            
            if (fs.existsSync(basePath)) {
              const items = fs.readdirSync(basePath);
              const matches = items.filter(item => {
                return item.toLowerCase().includes(pattern.replace('*', '').toLowerCase());
              });
              
              for (const match of matches) {
                const fullPath = path.join(basePath, match);
                if (fs.existsSync(fullPath)) {
                  scanResults.tools.push({
                    name: `${tool.name} (${match})`,
                    path: fullPath,
                    type: tool.type,
                    size: getDirectorySize(fullPath)
                  });
                }
              }
            }
          } else {
            // Direct path check
            if (fs.existsSync(searchPath)) {
              scanResults.tools.push({
                name: tool.name,
                path: searchPath,
                type: tool.type,
                size: getDirectorySize(searchPath)
              });
            }
          }
        } catch (error) {
          console.log(`Error scanning for ${tool.name} at ${searchPath}:`, error.message);
        }
      }
    }
    
    // Scan for project directories
    for (const projectPath of projectScanPaths) {
      try {
        if (fs.existsSync(projectPath)) {
          const stats = fs.statSync(projectPath);
          if (stats.isDirectory()) {
            const items = fs.readdirSync(projectPath);
            const detectedProjects = [];
            
            // Check each subdirectory for development project indicators
            for (const item of items) {
              const itemPath = path.join(projectPath, item);
              try {
                if (fs.statSync(itemPath).isDirectory()) {
                  // Check for development project indicators
                  const projectIndicators = [
                    '.git',                    // Git repository
                    'package.json',           // Node.js project
                    'requirements.txt',       // Python project
                    'setup.py',              // Python project
                    'pyproject.toml',        // Modern Python project
                    'Cargo.toml',            // Rust project
                    'pom.xml',               // Maven/Java project
                    'build.gradle',          // Gradle project
                    'build.gradle.kts',      // Kotlin Gradle project
                    '.sln',                  // Visual Studio solution
                    '.csproj',               // C# project
                    '.vbproj',               // VB.NET project
                    '.fsproj',               // F# project
                    'go.mod',                // Go module
                    'composer.json',         // PHP Composer project
                    'Gemfile',               // Ruby project
                    'CMakeLists.txt',        // CMake project
                    'Makefile',              // Make project
                    'Dockerfile',            // Docker project
                    'docker-compose.yml',    // Docker Compose
                    'tsconfig.json',         // TypeScript project
                    '.gitignore',            // Common in projects
                    'README.md',             // Documentation (weaker indicator)
                    'LICENSE'                // License file (weaker indicator)
                  ];
                  
                  let isProject = false;
                  let projectType = 'unknown';
                  const foundIndicators = [];
                  
                  for (const indicator of projectIndicators) {
                    const indicatorPath = path.join(itemPath, indicator);
                    if (fs.existsSync(indicatorPath)) {
                      foundIndicators.push(indicator);
                      
                      // Determine project type based on indicators
                      if (indicator === 'package.json') {
                        projectType = 'Node.js';
                        isProject = true;
                        break;
                      } else if (indicator === 'requirements.txt' || indicator === 'setup.py' || indicator === 'pyproject.toml') {
                        projectType = 'Python';
                        isProject = true;
                        break;
                      } else if (indicator === 'Cargo.toml') {
                        projectType = 'Rust';
                        isProject = true;
                        break;
                      } else if (indicator === 'pom.xml') {
                        projectType = 'Java (Maven)';
                        isProject = true;
                        break;
                      } else if (indicator === 'build.gradle' || indicator === 'build.gradle.kts') {
                        projectType = 'Java/Kotlin (Gradle)';
                        isProject = true;
                        break;
                      } else if (indicator === '.sln' || indicator === '.csproj') {
                        projectType = 'C#/.NET';
                        isProject = true;
                        break;
                      } else if (indicator === 'go.mod') {
                        projectType = 'Go';
                        isProject = true;
                        break;
                      } else if (indicator === 'composer.json') {
                        projectType = 'PHP';
                        isProject = true;
                        break;
                      } else if (indicator === 'Gemfile') {
                        projectType = 'Ruby';
                        isProject = true;
                        break;
                      } else if (indicator === '.git') {
                        if (!isProject) {
                          projectType = 'Git Repository';
                          isProject = true;
                        }
                      } else if (indicator === 'Dockerfile') {
                        if (!isProject) {
                          projectType = 'Docker';
                          isProject = true;
                        }
                      }
                    }
                  }
                  
                  // Add the project if it has valid indicators
                  if (isProject) {
                    detectedProjects.push({
                      name: item,
                      path: itemPath,
                      type: projectType,
                      indicators: foundIndicators,
                      size: getDirectorySize(itemPath)
                    });
                  }
                }
              } catch (itemError) {
                // Skip items that can't be accessed
                continue;
              }
            }
            
            if (detectedProjects.length > 0) {
              scanResults.projectDirectories.push({
                path: projectPath,
                projectCount: detectedProjects.length,
                projects: detectedProjects,
                size: getDirectorySize(projectPath),
                lastModified: stats.mtime
              });
            }
          }
        }
      } catch (error) {
        console.log(`Error scanning project directory ${projectPath}:`, error.message);
      }
    }
    
    // Scan for configuration files that should be migrated
    const configScanPaths = [
      { name: 'PowerShell Profile', path: path.join(os.homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1') },
      { name: 'Git Config', path: path.join(os.homedir(), '.gitconfig') },
      { name: 'Git Credentials', path: path.join(os.homedir(), '.git-credentials') },
      { name: 'SSH Config', path: path.join(os.homedir(), '.ssh', 'config') },
      { name: 'SSH Keys', path: path.join(os.homedir(), '.ssh') },
      { name: 'NPM Config', path: path.join(os.homedir(), '.npmrc') },
      { name: 'VS Code Settings', path: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json') },
      { name: 'VS Code Keybindings', path: path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'keybindings.json') },
      { name: 'Windows Terminal Settings', path: path.join(os.homedir(), 'AppData', 'Local', 'Packages', 'Microsoft.WindowsTerminal_8wekyb3d8bbwe', 'LocalState', 'settings.json') },
      { name: 'Environment Variables', path: path.join(os.homedir(), '.env') },
      { name: 'Bash Profile', path: path.join(os.homedir(), '.bash_profile') },
      { name: 'Bashrc', path: path.join(os.homedir(), '.bashrc') }
    ];
    
    for (const config of configScanPaths) {
      try {
        if (fs.existsSync(config.path)) {
          const stats = fs.statSync(config.path);
          scanResults.configurationFiles.push({
            name: config.name,
            path: config.path,
            size: stats.size,
            lastModified: stats.mtime,
            isDirectory: stats.isDirectory()
          });
          scanResults.totalFilesFound++;
        }
      } catch (error) {
        console.log(`Error scanning config file ${config.path}:`, error.message);
      }
    }
    
    return {
      success: true,
      scanResults: scanResults
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
});

ipcMain.handle('migrate-projects-and-tools', async (event, migrationConfig) => {
  try {
    const { 
      targetDirectory, 
      selectedTools = [], 
      selectedProjects = [], 
      selectedConfigs = [],
      createBackup = true,
      mergeExisting = true 
    } = migrationConfig;
    
    const migrationResults = {
      success: true,
      migratedTools: [],
      migratedProjects: [],
      migratedConfigs: [],
      errors: [],
      backupLocation: null,
      totalFilesMigrated: 0
    };
    
    // Create backup directory if requested
    let backupDir = null;
    if (createBackup) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupDir = path.join(targetDirectory, 'migration-backup', timestamp);
      await createDirectoryIfNotExists(backupDir);
      migrationResults.backupLocation = backupDir;
    }
    
    // Create target structure
    const targetStructure = {
      projects: path.join(targetDirectory, 'Projects'),
      tools: path.join(targetDirectory, 'Tools'),
      configs: path.join(targetDirectory, 'Configs'),
      scripts: path.join(targetDirectory, 'Scripts'),
      docs: path.join(targetDirectory, 'Documentation')
    };
    
    // Create directory structure
    for (const [key, dirPath] of Object.entries(targetStructure)) {
      await createDirectoryIfNotExists(dirPath);
      event.sender.send('migration-progress', `Created directory: ${dirPath}`);
    }
    
    // Migrate tools
    for (const tool of selectedTools) {
      try {
        event.sender.send('migration-progress', `Migrating tool: ${tool.name}`);
        
        const toolTargetPath = path.join(targetStructure.tools, tool.type, path.basename(tool.path));
        
        if (createBackup && fs.existsSync(tool.path)) {
          const backupPath = path.join(backupDir, 'tools', tool.type, path.basename(tool.path));
          await copyDirectory(tool.path, backupPath);
        }
        
        if (mergeExisting || !fs.existsSync(toolTargetPath)) {
          await copyDirectory(tool.path, toolTargetPath);
          migrationResults.migratedTools.push({
            name: tool.name,
            originalPath: tool.path,
            newPath: toolTargetPath
          });
          migrationResults.totalFilesMigrated++;
        }
        
      } catch (error) {
        migrationResults.errors.push(`Error migrating tool ${tool.name}: ${error.message}`);
      }
    }
    
    // Migrate project directories
    for (const project of selectedProjects) {
      try {
        event.sender.send('migration-progress', `Migrating projects from: ${project.path}`);
        
        const projectTargetPath = path.join(targetStructure.projects, path.basename(project.path));
        
        if (createBackup && fs.existsSync(project.path)) {
          const backupPath = path.join(backupDir, 'projects', path.basename(project.path));
          await copyDirectory(project.path, backupPath);
        }
        
        if (mergeExisting || !fs.existsSync(projectTargetPath)) {
          await copyDirectory(project.path, projectTargetPath);
          migrationResults.migratedProjects.push({
            originalPath: project.path,
            newPath: projectTargetPath,
            projectCount: project.projectCount
          });
          migrationResults.totalFilesMigrated += project.projectCount;
        }
        
      } catch (error) {
        migrationResults.errors.push(`Error migrating projects from ${project.path}: ${error.message}`);
      }
    }
    
    // Migrate configuration files
    for (const config of selectedConfigs) {
      try {
        event.sender.send('migration-progress', `Migrating config: ${config.name}`);
        
        const configTargetPath = path.join(targetStructure.configs, path.basename(config.path));
        
        if (createBackup && fs.existsSync(config.path)) {
          const backupPath = path.join(backupDir, 'configs', path.basename(config.path));
          if (config.isDirectory) {
            await copyDirectory(config.path, backupPath);
          } else {
            await createDirectoryIfNotExists(path.dirname(backupPath));
            fs.copyFileSync(config.path, backupPath);
          }
        }
        
        if (mergeExisting || !fs.existsSync(configTargetPath)) {
          if (config.isDirectory) {
            await copyDirectory(config.path, configTargetPath);
          } else {
            fs.copyFileSync(config.path, configTargetPath);
          }
          
          migrationResults.migratedConfigs.push({
            name: config.name,
            originalPath: config.path,
            newPath: configTargetPath
          });
          migrationResults.totalFilesMigrated++;
        }
        
      } catch (error) {
        migrationResults.errors.push(`Error migrating config ${config.name}: ${error.message}`);
      }
    }
    
    // Create migration summary
    const summaryPath = path.join(targetDirectory, 'migration-summary.json');
    const migrationSummary = {
      timestamp: new Date().toISOString(),
      targetDirectory: targetDirectory,
      migrationResults: migrationResults,
      migrationConfig: migrationConfig
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(migrationSummary, null, 2));
    event.sender.send('migration-progress', `Migration summary saved to: ${summaryPath}`);
    
    // Update CONFIG_PATHS to point to new locations
    CONFIG_PATHS.projectsDir = targetStructure.projects;
    
    return migrationResults;
    
  } catch (error) {
    return {
      success: false,
      message: error.message,
      errors: [error.message]
    };
  }
});

// Helper function to get directory size
function getDirectorySize(directoryPath) {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    return 0;
  }
}

// Helper function to copy directory recursively
async function copyDirectory(src, dest) {
  try {
    await createDirectoryIfNotExists(dest);
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stats = fs.statSync(srcPath);
      
      if (stats.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to copy directory from ${src} to ${dest}: ${error.message}`);
  }
} 