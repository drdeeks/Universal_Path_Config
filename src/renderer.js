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
        
        // IPC listeners
        ipcRenderer.on('setup-output', (event, data) => this.handleSetupOutput(data));
        ipcRenderer.on('setup-error', (event, data) => this.handleSetupError(data));
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
        const projectsPath = path.join(require('os').homedir(), 'Projects');
        spawn('explorer', [projectsPath], {
            detached: true,
            stdio: 'ignore'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DevSetupApp();
}); 