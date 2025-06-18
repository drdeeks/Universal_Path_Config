# Build Instructions for Universal Dev Setup Executable

## Prerequisites

Before building the executable, ensure you have:

1. **Node.js 18+** installed
2. **Git** installed 
3. **Icon files** in proper formats (see Icon Setup below)
4. **Windows build tools** (for native modules)

## Icon Setup

The build process requires an ICO file for Windows executables. Follow these steps:

### Step 1: Create or Download Icon
- Use the existing `assets/icon.png` or replace with your custom 256x256 pixel PNG
- Ensure the icon is square and represents development tools

### Step 2: Convert PNG to ICO
Use one of these online converters to create `assets/icon.ico`:
- **ConvertICO.com**: https://convertico.com/ (recommended)
- **PNG2ICO.com**: https://www.png2ico.com/
- **CloudConvert**: https://cloudconvert.com/png-to-ico

**Conversion Settings:**
- Include sizes: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
- Maintain transparency
- Save as `assets/icon.ico`

## Build Process

### Step 1: Install Dependencies
```bash
# Install all dependencies
npm install

# Install app dependencies for electron-builder
npm run postinstall
```

### Step 2: Build Options

#### Option A: Build Everything (Recommended)
```bash
# Creates both installer and portable executable
npm run build
```
**Output:**
- `dist/Universal Dev Setup Setup 1.0.0.exe` (NSIS Installer)
- `dist/Universal Dev Setup 1.0.0 Portable.exe` (Portable)
- `dist/win-unpacked/` (Unpacked app files)

#### Option B: Windows-Specific Build
```bash
# Windows targets only
npm run build:win
```

#### Option C: Portable Only
```bash
# Creates only portable executable
npm run build:portable
```

#### Option D: Package Without Installer
```bash
# Creates unpacked app in dist/win-unpacked/
npm run pack
```

### Step 3: Verify Build Output

After building, check the `dist/` directory:

```
dist/
├── Universal Dev Setup Setup 1.0.0.exe     # Full installer (recommended)
├── Universal Dev Setup 1.0.0 Portable.exe  # Portable version
├── win-unpacked/                            # Unpacked application
│   ├── Universal Dev Setup.exe             # Main executable
│   ├── resources/                           # App resources
│   └── ...                                 # Other runtime files
├── builder-effective-config.yaml           # Build configuration used
└── latest.yml                              # Update information
```

## Distribution Files

### NSIS Installer (Recommended for End Users)
- **File**: `Universal Dev Setup Setup 1.0.0.exe`
- **Size**: ~150-200MB
- **Features**:
  - Professional installation wizard
  - Start menu shortcuts
  - Desktop shortcut option
  - Uninstaller included
  - Registry integration
  - Admin rights handling
  - Multi-language support

### Portable Executable
- **File**: `Universal Dev Setup 1.0.0 Portable.exe`
- **Size**: ~150-200MB
- **Features**:
  - No installation required
  - Run from any location
  - USB-friendly
  - Admin rights required for functionality

## Troubleshooting Build Issues

### Common Issues

#### 1. Missing ICO File
**Error**: `Cannot resolve icon`
**Solution**: 
```bash
# Ensure icon.ico exists
ls assets/icon.ico
# If missing, convert PNG to ICO using online tools
```

#### 2. Build Tools Missing
**Error**: `MSBuild tools not found`
**Solution**:
```bash
# Install Windows Build Tools
npm install -g windows-build-tools
# Or install Visual Studio with C++ tools
```

#### 3. Node Modules Issues
**Error**: `Cannot find module` or rebuild errors
**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run postinstall
```

#### 4. Electron Download Issues
**Error**: `Failed to download electron`
**Solution**:
```bash
# Set electron mirror (if in restricted network)
npm config set electron_mirror https://npm.taobao.org/mirrors/electron/
# Or use cache
npm config set cache /path/to/npm/cache
```

#### 5. NSIS Script Errors
**Error**: NSIS compilation errors
**Solution**:
- Check `build/installer.nsh` syntax
- Ensure all referenced files exist
- Verify registry key formats

### Debug Build
```bash
# Enable debug output
DEBUG=electron-builder npm run build

# Or build with verbose logging
npm run build -- --publish=never --config.debug=true
```

## Testing the Executable

### Before Distribution

1. **Test Installer**:
   ```bash
   # Run the installer in a VM or test machine
   # Verify all shortcuts are created
   # Check Start menu entry
   # Test uninstaller
   ```

2. **Test Portable Version**:
   ```bash
   # Copy to different location
   # Right-click → Run as Administrator
   # Verify all functionality works
   ```

3. **Test Admin Requirements**:
   ```bash
   # Ensure app properly requests admin rights
   # Verify development tools can be installed
   # Check PowerShell execution policy changes
   ```

## Advanced Configuration

### Custom Build Settings

Edit `package.json` build section for customizations:

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "requestedExecutionLevel": "requireAdministrator"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

### Environment Variables

Set these for automated builds:

```bash
# Disable electron rebuilding (if issues)
export ELECTRON_SKIP_BINARY_DOWNLOAD=1

# Custom cache directory
export ELECTRON_CACHE=/path/to/cache

# GitHub token for releases
export GH_TOKEN=your_github_token
```

## Release Process

### Manual Release

1. **Build and Test**:
   ```bash
   npm run build
   # Test both installer and portable versions
   ```

2. **Create GitHub Release**:
   - Create new release tag (e.g., v1.0.0)
   - Upload `dist/*.exe` files
   - Add release notes

3. **Update Documentation**:
   - Update download links in README
   - Document any breaking changes

### Automated Release

Configure GitHub Actions for automated releases:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/*.exe
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## File Sizes and Requirements

### Typical File Sizes
- **Source code**: ~2MB
- **Node modules**: ~150MB
- **Built installer**: ~180-220MB
- **Portable executable**: ~180-220MB

### User System Requirements
- **Windows 10/11** (version 1903 or higher)
- **4GB RAM** minimum (8GB recommended)
- **200MB disk space** for application
- **5GB+ disk space** for development tools
- **Administrator privileges** required
- **Internet connection** for tool downloads

## Security Considerations

### Code Signing (Optional)
For production distribution, consider code signing:

```bash
# Install certificate and configure
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
npm run build
```

### Antivirus Whitelisting
The executable may trigger antivirus warnings due to:
- Admin privilege requirements
- PowerShell script execution
- Network downloads

Consider submitting to antivirus vendors for whitelisting.

## Support and Maintenance

### Updating the Application
1. Update version in `package.json`
2. Update changelog/release notes
3. Rebuild and test
4. Create new release

### User Support
- Provide clear installation instructions
- Document system requirements
- Include troubleshooting guide
- Offer multiple download options (installer vs portable)

---

**Note**: This build process creates production-ready executables suitable for distribution to end users who don't have Node.js installed. 