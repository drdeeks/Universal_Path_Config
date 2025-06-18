// Simple script to create a basic app icon for building
// This creates a temporary icon for testing purposes

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that represents development tools
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="256" height="256" rx="32" fill="url(#bg)"/>
  
  <!-- Code/Terminal icon -->
  <g fill="url(#icon)" stroke="none">
    <!-- Terminal window -->
    <rect x="32" y="64" width="192" height="128" rx="8" fill="none" stroke="url(#icon)" stroke-width="4"/>
    
    <!-- Terminal prompt symbols -->
    <text x="48" y="120" font-family="monospace" font-size="24" fill="url(#icon)">&gt;</text>
    <text x="72" y="120" font-family="monospace" font-size="16" fill="url(#icon)">npm</text>
    
    <!-- Gear/Settings icon -->
    <circle cx="128" cy="200" r="20" fill="none" stroke="url(#icon)" stroke-width="4"/>
    <circle cx="128" cy="200" r="8" fill="url(#icon)"/>
    
    <!-- Code brackets -->
    <text x="180" y="120" font-family="monospace" font-size="32" fill="url(#icon)">{}</text>
  </g>
  
  <!-- Title text -->
  <text x="128" y="240" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="url(#icon)">DEV SETUP</text>
</svg>`;

// Save the SVG icon
const iconPath = path.join(__dirname, 'assets', 'icon.svg');
fs.writeFileSync(iconPath, svgIcon);

    console.log('[OK] Created SVG icon at:', iconPath);
console.log('Next steps:');
console.log('   1. Convert icon.svg to icon.png (256x256) using online tool or Inkscape');
console.log('   2. Convert icon.png to icon.ico using one of these:');
console.log('      - https://convertico.com/');
console.log('      - https://www.png2ico.com/');
console.log('      - https://cloudconvert.com/png-to-ico');
console.log('   3. Save as assets/icon.ico');
console.log('   4. Run npm run build');
console.log('');
console.log('[WARN] For now, the build will fail without icon.ico file.');
console.log('   This is normal - just follow the conversion steps above.'); 