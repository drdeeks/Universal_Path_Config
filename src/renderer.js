const { ipcRenderer } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevSetupApp {
    constructor() {
        this.isRunning = false;
        this.setupProcess = null;
        this.consoleOutput = '';
        this.progress = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.checkInitialStatus();
    }

    initializeElements() {
        // Admin check elements
        this.checkAdminBtn = document.getElementById('check-admin-btn');
        this.adminStatus = document.getElementById('admin-status');
        
        // Tool status elements
        this.refreshStatusBtn = document.getElementById('refresh-status-btn');
        this.statusGrid = document.getElementById('status-grid');
        
        // Form elements
        this.setupForm = document.getElementById('setup-form');
        this.gitUsername = document.getElementById('git-username');
        this.gitEmail = document.getElementById('git-email');
        this.skipInstallation = document.getElementById('skip-installation');
        this.configureOnly = document.getElementById('configure-only');
        
        // Setup control elements
        this.startSetupBtn = document.getElementById('start-setup-btn');
        this.stopSetupBtn = document.getElementById('stop-setup-btn');
        
        // Progress elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Console elements
        this.consoleOutputEl = document.getElementById('console-output');
        this.clearConsoleBtn = document.getElementById('clear-console-btn');
        this.saveLogBtn = document.getElementById('save-log-btn');
        
        // Post-installation elements
        this.postInstall = document.getElementById('post-install');
        this.restartTerminalBtn = document.getElementById('restart-terminal-btn');
        this.openProjectsBtn = document.getElementById('open-projects-btn');
        
        // New verification elements
        this.verifyEnvironmentBtn = document.getElementById('verify-environment-btn');
        this.configurePathsBtn = document.getElementById('configure-paths-btn');
        this.cleanupDuplicatesBtn = document.getElementById('cleanup-duplicates-btn');
        this.verificationResults = document.getElementById('verification-results');
        
        // Migration elements
        this.migrationTargetDir = document.getElementById('migration-target-dir');
        this.selectTargetDirBtn = document.getElementById('select-target-dir-btn');
        this.scanExistingBtn = document.getElementById('scan-existing-btn');
        this.startMigrationBtn = document.getElementById('start-migration-btn');
        this.createBackupCheckbox = document.getElementById('create-backup');
        this.mergeExistingCheckbox = document.getElementById('merge-existing');
        this.scanResults = document.getElementById('scan-results');
        this.toolsList = document.getElementById('tools-list');
        this.projectsList = document.getElementById('projects-list');
        this.configsList = document.getElementById('configs-list');
        this.migrationProgress = document.getElementById('migration-progress');
        this.migrationProgressFill = document.getElementById('migration-progress-fill');
        this.migrationStatus = document.getElementById('migration-status');
        this.migrationLog = document.getElementById('migration-log');
        this.migrationResults = document.getElementById('migration-results');
    }

    bindEvents() {
        // Admin check
        this.checkAdminBtn.addEventListener('click', () => this.checkAdminPrivileges());
        
        // Tool status
        this.refreshStatusBtn.addEventListener('click', () => this.refreshToolStatus());
        
        // Setup controls
        this.startSetupBtn.addEventListener('click', () => this.startSetup());
        this.stopSetupBtn.addEventListener('click', () => this.stopSetup());
        
        // Console controls
        this.clearConsoleBtn.addEventListener('click', () => this.clearConsole());
        this.saveLogBtn.addEventListener('click', () => this.saveLog());
        
        // Post-installation actions
        this.restartTerminalBtn.addEventListener('click', () => this.openNewTerminal());
        this.openProjectsBtn.addEventListener('click', () => this.openProjectsFolder());
        
        // Form validation
        this.gitUsername.addEventListener('input', () => this.validateForm());
        this.gitEmail.addEventListener('input', () => this.validateForm());
        this.skipInstallation.addEventListener('change', () => this.handleCheckboxChange());
        this.configureOnly.addEventListener('change', () => this.handleCheckboxChange());
        
        // Environment verification
        if (this.verifyEnvironmentBtn) {
            this.verifyEnvironmentBtn.addEventListener('click', () => this.verifyEnvironmentStructure());
        }
        
        // Path configuration
        if (this.configurePathsBtn) {
            this.configurePathsBtn.addEventListener('click', () => this.configureTerminalPaths());
        }
        
        // Cleanup duplicates
        if (this.cleanupDuplicatesBtn) {
            this.cleanupDuplicatesBtn.addEventListener('click', () => this.cleanupDuplicateFiles());
        }
        
        // Migration event listeners
        if (this.selectTargetDirBtn) {
            this.selectTargetDirBtn.addEventListener('click', () => this.selectTargetDirectory());
        }
        
        if (this.scanExistingBtn) {
            this.scanExistingBtn.addEventListener('click', () => this.scanForExistingToolsAndProjects());
        }
        
        if (this.startMigrationBtn) {
            this.startMigrationBtn.addEventListener('click', () => this.startMigration());
        }
        
        // IPC listeners
        ipcRenderer.on('setup-output', (event, data) => this.handleSetupOutput(data));
        ipcRenderer.on('setup-error', (event, data) => this.handleSetupError(data));
        ipcRenderer.on('migration-progress', (event, data) => this.handleMigrationProgress(data));
    }

    async checkInitialStatus() {
        await this.checkAdminPrivileges();
        await this.refreshToolStatus();
        
        // Don't run automatic verification - wait for user to click the button
        const isAdmin = await ipcRenderer.invoke('check-admin');
        if (isAdmin) {
            this.logToConsole('[OK] Administrator privileges confirmed. Ready for setup!', 'success');
            this.logToConsole('[INFO] Click "Verify Environment" when ready to check your system.', 'info');
        }
    }

    async checkAdminPrivileges() {
        try {
            this.checkAdminBtn.disabled = true;
            this.checkAdminBtn.textContent = 'Checking...';
            
            const isAdmin = await ipcRenderer.invoke('check-admin');
            
            this.adminStatus.className = 'status-indicator';
            if (isAdmin) {
                this.adminStatus.classList.add('admin');
                this.adminStatus.textContent = '✅ Administrator Privileges: GRANTED';
                this.enableSetupControls();
            } else {
                this.adminStatus.classList.add('no-admin');
                this.adminStatus.textContent = '❌ Administrator Privileges: REQUIRED - Please restart as Admin';
                this.disableSetupControls();
            }
        } catch (error) {
            this.adminStatus.className = 'status-indicator no-admin';
            this.adminStatus.textContent = '[ERROR] Error checking admin status';
            this.logToConsole(`Error checking admin status: ${error}`, 'error');
        } finally {
            this.checkAdminBtn.disabled = false;
            this.checkAdminBtn.textContent = 'Check Admin Status';
        }
    }

    async refreshToolStatus() {
        try {
            this.refreshStatusBtn.disabled = true;
            this.refreshStatusBtn.textContent = 'Checking...';
            
            const toolStatus = await ipcRenderer.invoke('check-tool-status');
            this.updateToolStatusDisplay(toolStatus);
        } catch (error) {
            this.logToConsole(`Error checking tool status: ${error}`, 'error');
        } finally {
            this.refreshStatusBtn.disabled = false;
            this.refreshStatusBtn.textContent = 'Refresh Status';
        }
    }

    async verifyEnvironmentStructure() {
        try {
            if (this.verifyEnvironmentBtn) {
                this.verifyEnvironmentBtn.disabled = true;
                this.verifyEnvironmentBtn.textContent = 'Verifying...';
            }
            
            this.logToConsole('Starting environment structure verification...', 'info');
            this.updateProgress(10, 'Verifying environment structure...');
            
            const results = await ipcRenderer.invoke('verify-environment-structure');
            
            this.updateProgress(100, 'Verification completed');
            
            // Display verification results
            this.displayVerificationResults(results);
            
            if (results.fixes.length > 0) {
                this.logToConsole(`[OK] Applied ${results.fixes.length} fixes:`, 'success');
                results.fixes.forEach(fix => {
                    this.logToConsole(`  • ${fix}`, 'success');
                });
            }
            
            if (results.issues.length > 0) {
                this.logToConsole(`[WARN] Found ${results.issues.length} issues:`, 'warning');
                results.issues.forEach(issue => {
                    this.logToConsole(`  • ${issue}`, 'warning');
                });
            }
            
            if (results.fixes.length === 0 && results.issues.length === 0) {
                this.logToConsole('[OK] Environment structure is already correctly configured!', 'success');
            }
            
            // Refresh tool status after verification
            await this.refreshToolStatus();
            
        } catch (error) {
            this.logToConsole(`[ERROR] Environment verification failed: ${error}`, 'error');
            this.updateProgress(0, 'Verification failed');
        } finally {
            if (this.verifyEnvironmentBtn) {
                this.verifyEnvironmentBtn.disabled = false;
                this.verifyEnvironmentBtn.textContent = 'Verify Environment';
            }
        }
    }

    async configureTerminalPaths() {
        try {
            if (this.configurePathsBtn) {
                this.configurePathsBtn.disabled = true;
                this.configurePathsBtn.textContent = 'Configuring...';
            }
            
            this.logToConsole('Starting terminal path configuration...', 'info');
            this.updateProgress(10, 'Configuring terminal paths...');
            
            const result = await ipcRenderer.invoke('configure-paths');
            
            this.updateProgress(100, 'Path configuration completed');
            
            if (result.success) {
                this.logToConsole('[OK] Terminal paths configured successfully!', 'success');
                this.logToConsole('[INFO] Please restart your terminal to apply changes.', 'info');
            } else {
                this.logToConsole(`[ERROR] Path configuration failed: ${result.error}`, 'error');
            }
            
        } catch (error) {
            this.logToConsole(`[ERROR] Path configuration failed: ${error}`, 'error');
            this.updateProgress(0, 'Configuration failed');
        } finally {
            if (this.configurePathsBtn) {
                this.configurePathsBtn.disabled = false;
                this.configurePathsBtn.textContent = 'Configure Terminal Paths';
            }
        }
    }

    async cleanupDuplicateFiles() {
        try {
            if (this.cleanupDuplicatesBtn) {
                this.cleanupDuplicatesBtn.disabled = true;
                this.cleanupDuplicatesBtn.textContent = 'Cleaning...';
            }
            
            this.logToConsole('Starting system-wide duplicate file cleanup...', 'info');
            this.updateProgress(10, 'Scanning for duplicate files...');
            
            const results = await ipcRenderer.invoke('cleanup-duplicate-files');
            
            this.updateProgress(100, 'Cleanup completed');
            
            // Display cleanup results
            this.displayCleanupResults(results);
            
            if (results.cleanedFiles && results.cleanedFiles.length > 0) {
                this.logToConsole(`[OK] Cleanup completed! Found and cleaned:`, 'success');
                results.cleanedFiles.forEach(category => {
                    this.logToConsole(`  • ${category}`, 'success');
                });
            }
            
            if (results.fixes && results.fixes.length > 0) {
                results.fixes.forEach(fix => {
                    this.logToConsole(`[OK] ${fix}`, 'success');
                });
            }
            
            if (results.issues && results.issues.length > 0) {
                this.logToConsole(`[WARN] Some cleanup issues occurred:`, 'warning');
                results.issues.forEach(issue => {
                    this.logToConsole(`  • ${issue}`, 'warning');
                });
            }
            
            if ((!results.cleanedFiles || results.cleanedFiles.length === 0) && 
                (!results.issues || results.issues.length === 0)) {
                this.logToConsole('[OK] System is already clean - no duplicates found!', 'success');
            }
            
        } catch (error) {
            this.logToConsole(`[ERROR] Cleanup failed: ${error}`, 'error');
            this.updateProgress(0, 'Cleanup failed');
        } finally {
            if (this.cleanupDuplicatesBtn) {
                this.cleanupDuplicatesBtn.disabled = false;
                this.cleanupDuplicatesBtn.textContent = 'Cleanup Duplicates';
            }
        }
    }

    displayVerificationResults(results) {
        if (!this.verificationResults) return;
        
        this.verificationResults.innerHTML = '';
        
        if (results.fixes && results.fixes.length > 0) {
            const fixesSection = document.createElement('div');
            fixesSection.className = 'verification-section fixes-section';
            fixesSection.innerHTML = `
                <h4>✅ Fixes Applied (${results.fixes.length})</h4>
                <ul>
                    ${results.fixes.map(fix => `<li>${fix}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(fixesSection);
        }
        
        if (results.cleanedFiles && results.cleanedFiles.length > 0) {
            const cleanupSection = document.createElement('div');
            cleanupSection.className = 'verification-section cleanup-section';
            cleanupSection.innerHTML = `
                <h4>🧹 Files Cleaned (${results.cleanedFiles.length} categories)</h4>
                <ul>
                    ${results.cleanedFiles.map(cleaned => `<li>${cleaned}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(cleanupSection);
        }
        
        if (results.issues && results.issues.length > 0) {
            const issuesSection = document.createElement('div');
            issuesSection.className = 'verification-section issues-section';
            issuesSection.innerHTML = `
                <h4>⚠️ Issues Found (${results.issues.length})</h4>
                <ul>
                    ${results.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(issuesSection);
        }
        
        if ((!results.fixes || results.fixes.length === 0) && 
            (!results.issues || results.issues.length === 0) &&
            (!results.cleanedFiles || results.cleanedFiles.length === 0)) {
            const successSection = document.createElement('div');
            successSection.className = 'verification-section success-section';
            successSection.innerHTML = `
                <h4>✨ All Good!</h4>
                <ul>
                    <li>Environment structure is correctly configured</li>
                    <li>No duplicate files found</li>
                    <li>System is clean and optimized</li>
                </ul>
            `;
            this.verificationResults.appendChild(successSection);
        }
    }

    displayCleanupResults(results) {
        if (!this.verificationResults) return;
        
        this.verificationResults.innerHTML = '';
        
        if (results.fixes && results.fixes.length > 0) {
            const cleanupSection = document.createElement('div');
            cleanupSection.className = 'verification-section cleanup-section';
            cleanupSection.innerHTML = `
                <h4>🧹 Cleanup Summary</h4>
                <ul>
                    ${results.fixes.map(fix => `<li>${fix}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(cleanupSection);
        }
        
        if (results.cleanedFiles && results.cleanedFiles.length > 0) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'verification-section cleanup-details-section';
            detailsSection.innerHTML = `
                <h4>📋 Cleanup Details</h4>
                <ul>
                    ${results.cleanedFiles.map(category => `<li>${category}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(detailsSection);
        }
        
        if (results.issues && results.issues.length > 0) {
            const issuesSection = document.createElement('div');
            issuesSection.className = 'verification-section issues-section';
            issuesSection.innerHTML = `
                <h4>⚠️ Cleanup Issues</h4>
                <ul>
                    ${results.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            `;
            this.verificationResults.appendChild(issuesSection);
        }
        
        if ((!results.fixes || results.fixes.length === 0) && 
            (!results.cleanedFiles || results.cleanedFiles.length === 0) &&
            (!results.issues || results.issues.length === 0)) {
            const cleanSection = document.createElement('div');
            cleanSection.className = 'verification-section success-section';
            cleanSection.innerHTML = `
                <h4>✨ System Already Clean!</h4>
                <ul>
                    <li>No duplicate configuration files found</li>
                    <li>Temporary files are already cleaned</li>
                    <li>System is optimized</li>
                </ul>
            `;
            this.verificationResults.appendChild(cleanSection);
        }
    }

    updateToolStatusDisplay(toolStatus) {
        const toolNames = {
            git: 'Git',
            node: 'Node.js',
            python: 'Python',
            code: 'VS Code',
            docker: 'Docker',
            wsl: 'WSL'
        };

        const toolIcons = {
            git: '[GIT]',
            node: '[NODE]',
            python: '[PY]',
            code: '[CODE]',
            docker: '[DOCKER]',
            wsl: '[WSL]'
        };

        this.statusGrid.innerHTML = '';
        
        Object.entries(toolStatus).forEach(([tool, status]) => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            
            const toolIcon = document.createElement('div');
            toolIcon.className = 'tool-icon';
            toolIcon.textContent = toolIcons[tool] || '[TOOL]';
            
            const toolName = document.createElement('div');
            toolName.className = 'tool-name';
            toolName.textContent = toolNames[tool] || tool;
            
            const toolStatusEl = document.createElement('div');
            toolStatusEl.className = 'tool-status';
            
            if (status.installed) {
                toolStatusEl.classList.add('installed');
                toolStatusEl.textContent = '[OK] Installed';
            } else {
                toolStatusEl.classList.add('not-installed');
                toolStatusEl.textContent = '[ERROR] Not Installed';
            }
            
            const toolVersion = document.createElement('div');
            toolVersion.className = 'tool-version';
            toolVersion.textContent = status.version || 'Version unknown';
            
            toolItem.appendChild(toolIcon);
            toolItem.appendChild(toolName);
            toolItem.appendChild(toolStatusEl);
            toolItem.appendChild(toolVersion);
            this.statusGrid.appendChild(toolItem);
        });
    }

    validateForm() {
        const isValid = this.gitUsername.value.trim() !== '' && this.gitEmail.value.trim() !== '';
        
        // Only disable if form is invalid OR currently running - don't require admin check
        if (this.startSetupBtn) {
            this.startSetupBtn.disabled = !isValid || this.isRunning;
        }
        
        return isValid;
    }

    handleCheckboxChange() {
        if (this.configureOnly.checked) {
            this.skipInstallation.checked = false;
        }
        if (this.skipInstallation.checked) {
            this.configureOnly.checked = false;
        }
    }

    enableSetupControls() {
        this.validateForm();
    }

    disableSetupControls() {
        this.startSetupBtn.disabled = true;
    }

    async startSetup() {
        if (!this.validateForm()) {
            alert('Please fill in Git username and email');
            return;
        }

        // Check admin privileges before starting
        const isAdmin = await ipcRenderer.invoke('check-admin');
        if (!isAdmin) {
            alert('Administrator privileges are required for setup. Please restart the application as Administrator.');
            return;
        }

        try {
            this.isRunning = true;
            this.startSetupBtn.disabled = true;
            this.stopSetupBtn.disabled = false;
            this.clearConsole();
            this.updateProgress(5, 'Initializing setup...');
            
            const options = {
                gitUserName: this.gitUsername.value.trim(),
                gitUserEmail: this.gitEmail.value.trim(),
                skipInstallation: this.skipInstallation.checked,
                configureOnly: this.configureOnly.checked
            };

            this.logToConsole('Starting Universal Development Environment Setup...', 'success');
            this.logToConsole('Configuration options:', 'info');
            this.logToConsole(`   • Git User: ${options.gitUserName}`, 'info');
            this.logToConsole(`   • Git Email: ${options.gitUserEmail}`, 'info');
            this.logToConsole(`   • Skip Installation: ${options.skipInstallation}`, 'info');
            this.logToConsole(`   • Configure Only: ${options.configureOnly}`, 'info');
            this.logToConsole('', 'info'); // Empty line for spacing
            
            // Run the main setup without extra verification steps
            this.updateProgress(10, 'Starting development environment setup...');
            this.logToConsole('Running setup process...', 'info');
            
            // Try the simple setup first for testing
            this.logToConsole('Using simplified setup process for debugging...', 'info');
            const result = await ipcRenderer.invoke('run-setup-simple', options);
            
            this.updateProgress(95, 'Setup completed, running final verification...');
            this.logToConsole('Running final verification...', 'info');
            
            // Only run verification once at the end
            await this.verifyEnvironmentStructure();
            
            this.updateProgress(100, 'Setup completed successfully!');
            this.logToConsole('[OK] Setup completed successfully!', 'success');
            this.logToConsole('Your development environment is ready!', 'success');
            this.showPostInstallation();
            
        } catch (error) {
            this.updateProgress(0, 'Setup failed');
            const errorMessage = error.error || error.message || 'Unknown error occurred';
            this.logToConsole(`[ERROR] Setup failed: ${errorMessage}`, 'error');
            this.logToConsole('[INFO] Try running "Verify Environment" first, or check the troubleshooting guide.', 'warning');
            alert(`Setup failed: ${errorMessage}\n\nTip: Try running "Verify Environment" first, or check console for details.`);
        } finally {
            this.isRunning = false;
            this.validateForm(); // Re-enable the button properly
            this.stopSetupBtn.disabled = true;
        }
    }

    stopSetup() {
        if (this.setupProcess) {
            this.setupProcess.kill();
            this.setupProcess = null;
        }
        this.isRunning = false;
        this.startSetupBtn.disabled = false;
        this.stopSetupBtn.disabled = true;
        this.updateProgress(0, 'Setup stopped by user');
                    this.logToConsole('[WARN] Setup stopped by user', 'warning');
    }

    handleSetupOutput(data) {
        this.logToConsole(data, 'info');
        this.updateProgressFromOutput(data);
    }

    handleSetupError(data) {
        this.logToConsole(data, 'error');
    }

    updateProgressFromOutput(output) {
        // Enhanced progress estimation with verification steps
        const progressKeywords = [
            'Verifying directory structure',
            'Verifying configuration files',
            'Installing Chocolatey',
            'Installing git',
            'Installing nodejs',
            'Installing vscode',
            'Installing docker-desktop',
            'Installing WSL',
            'Configuring PowerShell',
            'Configuring Git',
            'VS Code settings configured',
            'Windows Terminal configured',
            'WSL integration enhanced',
            'VS Code extensions verified',
            'NPM global packages verified',
            'Testing installation'
        ];

        let foundKeywords = 0;
        progressKeywords.forEach(keyword => {
            if (output.toLowerCase().includes(keyword.toLowerCase())) {
                foundKeywords++;
            }
        });

        const progressPercent = Math.min((foundKeywords / progressKeywords.length) * 90, 90);
        this.updateProgress(progressPercent, output.split('\n')[0] || 'Processing...');
    }

    updateProgress(percent, text) {
        this.progress = percent;
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `output-line ${type}-line`;
        line.textContent = `[${timestamp}] ${message}`;
        
        this.consoleOutputEl.appendChild(line);
        this.consoleOutputEl.scrollTop = this.consoleOutputEl.scrollHeight;
        
        this.consoleOutput += `[${timestamp}] ${message}\n`;
    }

    clearConsole() {
        this.consoleOutputEl.innerHTML = '';
        this.consoleOutput = '';
    }

    saveLog() {
        const blob = new Blob([this.consoleOutput], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dev-setup-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showPostInstallation() {
        this.postInstall.style.display = 'block';
        this.postInstall.scrollIntoView({ behavior: 'smooth' });
    }

    openNewTerminal() {
        spawn('powershell', [], { 
            detached: true,
            stdio: 'ignore'
        });
    }

    openProjectsFolder() {
        const { spawn } = require('child_process');
        const os = require('os');
        const path = require('path');
        
        const projectsPath = path.join(os.homedir(), 'Projects');
        spawn('explorer', [projectsPath], { shell: true });
    }

    // Migration Methods
    async selectTargetDirectory() {
        try {
            this.selectTargetDirBtn.disabled = true;
            this.selectTargetDirBtn.textContent = 'Selecting...';
            
            const result = await ipcRenderer.invoke('select-projects-directory');
            
            if (result.success) {
                this.migrationTargetDir.value = result.path;
                this.logToConsole(`Selected target directory: ${result.path}`, 'success');
                
                // Enable scan button if directory is selected
                if (this.scanExistingBtn) {
                    this.scanExistingBtn.disabled = false;
                }
            } else {
                this.logToConsole(`Directory selection cancelled: ${result.message}`, 'info');
            }
        } catch (error) {
            this.logToConsole(`Error selecting directory: ${error}`, 'error');
        } finally {
            this.selectTargetDirBtn.disabled = false;
            this.selectTargetDirBtn.textContent = 'Browse';
        }
    }
    
    async scanForExistingToolsAndProjects() {
        try {
            this.scanExistingBtn.disabled = true;
            this.scanExistingBtn.textContent = 'Scanning...';
            
            this.logToConsole('Starting comprehensive scan for tools, projects, and configurations...', 'info');
            
            const result = await ipcRenderer.invoke('scan-for-existing-tools');
            
            if (result.success) {
                this.displayScanResults(result.scanResults);
                this.scanResults.style.display = 'block';
                
                // Enable migration button if items found
                const totalItems = result.scanResults.tools.length + 
                                 result.scanResults.projectDirectories.length + 
                                 result.scanResults.configurationFiles.length;
                
                if (totalItems > 0 && this.migrationTargetDir.value) {
                    this.startMigrationBtn.disabled = false;
                }
                
                this.logToConsole(`Scan completed! Found ${totalItems} items to migrate.`, 'success');
            } else {
                this.logToConsole(`Scan failed: ${result.message}`, 'error');
            }
        } catch (error) {
            this.logToConsole(`Error during scan: ${error}`, 'error');
        } finally {
            this.scanExistingBtn.disabled = false;
            this.scanExistingBtn.textContent = 'Scan for Tools & Projects';
        }
    }
    
    displayScanResults(scanResults) {
        // Display tools
        this.toolsList.innerHTML = '';
        scanResults.tools.forEach(tool => {
            const toolElement = this.createScanResultItem(tool, 'tool');
            this.toolsList.appendChild(toolElement);
        });
        
        if (scanResults.tools.length === 0) {
            this.toolsList.innerHTML = '<p class="no-items">No development tools found in common locations.</p>';
        }
        
        // Display project directories
        this.projectsList.innerHTML = '';
        scanResults.projectDirectories.forEach(project => {
            const projectElement = this.createScanResultItem(project, 'project');
            this.projectsList.appendChild(projectElement);
        });
        
        if (scanResults.projectDirectories.length === 0) {
            this.projectsList.innerHTML = '<p class="no-items">No project directories found in common locations.</p>';
        }
        
        // Display configuration files
        this.configsList.innerHTML = '';
        scanResults.configurationFiles.forEach(config => {
            const configElement = this.createScanResultItem(config, 'config');
            this.configsList.appendChild(configElement);
        });
        
        if (scanResults.configurationFiles.length === 0) {
            this.configsList.innerHTML = '<p class="no-items">No configuration files found.</p>';
        }
    }
    
    createScanResultItem(item, type) {
        const div = document.createElement('div');
        div.className = 'scan-result-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.dataset.type = type;
        checkbox.dataset.itemData = JSON.stringify(item);
        
        const label = document.createElement('label');
        label.className = 'scan-item-label';
        
        const title = document.createElement('strong');
        title.textContent = item.name || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        const path = document.createElement('div');
        path.className = 'item-path';
        path.textContent = item.path;
        
        const details = document.createElement('div');
        details.className = 'item-details';
        
        if (type === 'tool') {
            details.textContent = `Type: ${item.type} | Size: ${this.formatFileSize(item.size)}`;
        } else if (type === 'project') {
            details.textContent = `Projects: ${item.projectCount} | Size: ${this.formatFileSize(item.size)}`;
        } else if (type === 'config') {
            details.textContent = `Size: ${this.formatFileSize(item.size)} | Modified: ${new Date(item.lastModified).toLocaleDateString()}`;
        }
        
        label.appendChild(title);
        label.appendChild(path);
        label.appendChild(details);
        
        div.appendChild(checkbox);
        div.appendChild(label);
        
        return div;
    }
    
    async startMigration() {
        try {
            // Collect selected items
            const selectedTools = [];
            const selectedProjects = [];
            const selectedConfigs = [];
            
            const checkboxes = this.scanResults.querySelectorAll('input[type="checkbox"]:checked');
            
            checkboxes.forEach(checkbox => {
                const itemData = JSON.parse(checkbox.dataset.itemData);
                const type = checkbox.dataset.type;
                
                if (type === 'tool') {
                    selectedTools.push(itemData);
                } else if (type === 'project') {
                    selectedProjects.push(itemData);
                } else if (type === 'config') {
                    selectedConfigs.push(itemData);
                }
            });
            
            const totalItems = selectedTools.length + selectedProjects.length + selectedConfigs.length;
            
            if (totalItems === 0) {
                this.logToConsole('No items selected for migration.', 'warning');
                return;
            }
            
            if (!this.migrationTargetDir.value) {
                this.logToConsole('Please select a target directory first.', 'error');
                return;
            }
            
            // Prepare migration config
            const migrationConfig = {
                targetDirectory: this.migrationTargetDir.value,
                selectedTools: selectedTools,
                selectedProjects: selectedProjects,
                selectedConfigs: selectedConfigs,
                createBackup: this.createBackupCheckbox.checked,
                mergeExisting: this.mergeExistingCheckbox.checked
            };
            
            // Start migration
            this.startMigrationBtn.disabled = true;
            this.startMigrationBtn.textContent = 'Migrating...';
            this.migrationProgress.style.display = 'block';
            this.migrationResults.style.display = 'none';
            
            this.logToConsole(`Starting migration of ${totalItems} items to ${this.migrationTargetDir.value}`, 'info');
            this.updateMigrationProgress(0, 'Preparing migration...');
            
            const result = await ipcRenderer.invoke('migrate-projects-and-tools', migrationConfig);
            
            if (result.success) {
                this.updateMigrationProgress(100, 'Migration completed successfully!');
                this.displayMigrationResults(result);
                this.logToConsole(`Migration completed! ${result.totalFilesMigrated} items migrated.`, 'success');
                
                if (result.backupLocation) {
                    this.logToConsole(`Backup created at: ${result.backupLocation}`, 'info');
                }
                
                if (result.errors.length > 0) {
                    this.logToConsole(`${result.errors.length} errors occurred during migration:`, 'warning');
                    result.errors.forEach(error => {
                        this.logToConsole(`  • ${error}`, 'warning');
                    });
                }
            } else {
                this.updateMigrationProgress(0, 'Migration failed');
                this.logToConsole(`Migration failed: ${result.message}`, 'error');
                
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach(error => {
                        this.logToConsole(`  • ${error}`, 'error');
                    });
                }
            }
            
        } catch (error) {
            this.updateMigrationProgress(0, 'Migration failed');
            this.logToConsole(`Migration error: ${error}`, 'error');
        } finally {
            this.startMigrationBtn.disabled = false;
            this.startMigrationBtn.textContent = 'Start Migration';
        }
    }
    
    handleMigrationProgress(data) {
        this.logToMigrationConsole(data);
    }
    
    updateMigrationProgress(percent, status) {
        if (this.migrationProgressFill) {
            this.migrationProgressFill.style.width = `${percent}%`;
        }
        if (this.migrationStatus) {
            this.migrationStatus.textContent = status;
        }
    }
    
    logToMigrationConsole(message) {
        if (this.migrationLog) {
            this.migrationLog.innerHTML += `<div class="log-entry">${new Date().toLocaleTimeString()} - ${message}</div>`;
            this.migrationLog.scrollTop = this.migrationLog.scrollHeight;
        }
    }
    
    displayMigrationResults(results) {
        this.migrationResults.style.display = 'block';
        
        const html = `
            <h4>Migration Results</h4>
            <div class="migration-summary">
                <div class="summary-card">
                    <h5>📁 Projects Migrated</h5>
                    <p>${results.migratedProjects.length} project directories</p>
                    ${results.migratedProjects.map(p => `<div class="migrated-item">• ${p.originalPath} → ${p.newPath}</div>`).join('')}
                </div>
                
                <div class="summary-card">
                    <h5>🛠️ Tools Migrated</h5>
                    <p>${results.migratedTools.length} development tools</p>
                    ${results.migratedTools.map(t => `<div class="migrated-item">• ${t.name}: ${t.originalPath} → ${t.newPath}</div>`).join('')}
                </div>
                
                <div class="summary-card">
                    <h5>⚙️ Configurations Migrated</h5>
                    <p>${results.migratedConfigs.length} configuration files</p>
                    ${results.migratedConfigs.map(c => `<div class="migrated-item">• ${c.name}: ${c.originalPath} → ${c.newPath}</div>`).join('')}
                </div>
                
                ${results.backupLocation ? `
                <div class="summary-card">
                    <h5>💾 Backup Created</h5>
                    <p>Backup location: ${results.backupLocation}</p>
                </div>
                ` : ''}
                
                ${results.errors.length > 0 ? `
                <div class="summary-card error-card">
                    <h5>⚠️ Errors (${results.errors.length})</h5>
                    ${results.errors.map(e => `<div class="error-item">• ${e}</div>`).join('')}
                </div>
                ` : ''}
            </div>
            
            <div class="post-migration-actions">
                <h5>Next Steps</h5>
                <ul>
                    <li>Update your IDE and terminal paths to point to the new locations</li>
                    <li>Test that all tools are accessible from the new directory structure</li>
                    <li>Consider updating environment variables to point to new tool locations</li>
                    <li>Verify all projects open correctly from their new locations</li>
                </ul>
            </div>
        `;
        
        this.migrationResults.innerHTML = html;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.devSetupApp = new DevSetupApp();
}); 