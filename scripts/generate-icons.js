const fs = require('fs');
const path = require('path');

// Simple SVG icon generator
function generateIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="#9e7162"/>
  <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.12}" fill="white"/>
  <path d="M${size * 0.35} ${size * 0.65}C${size * 0.35} ${size * 0.6} ${size * 0.4} ${size * 0.55} ${size * 0.45} ${size * 0.55}H${size * 0.55}C${size * 0.6} ${size * 0.55} ${size * 0.65} ${size * 0.6} ${size * 0.65} ${size * 0.65}V${size * 0.7}H${size * 0.35}V${size * 0.65}Z" fill="white"/>
  <text x="${size * 0.5}" y="${size * 0.85}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold">D</text>
</svg>`;
}

// Icon sizes needed
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
iconSizes.forEach(size => {
  const svgContent = generateIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Created ${filename}`);
});

// Create Apple touch icon
const appleIcon = generateIcon(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleIcon);
console.log('Created apple-touch-icon.svg');

// Create favicon
const favicon = generateIcon(32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), favicon);
console.log('Created favicon.svg');

// Create Safari pinned tab icon
const safariIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" rx="4" fill="#9e7162"/>
  <circle cx="8" cy="6.4" r="1.92" fill="white"/>
  <path d="M5.6 10.4C5.6 9.6 6.4 8.8 7.2 8.8H8.8C9.6 8.8 10.4 9.6 10.4 10.4V11.2H5.6V10.4Z" fill="white"/>
  <text x="8" y="13.6" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="1.92" font-weight="bold">D</text>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), safariIcon);
console.log('Created safari-pinned-tab.svg');

console.log('✅ All icons generated successfully!');
