const fs = require('fs');
const path = require('path');

// First copy the original image directly
const src = 'C:/Users/Harsh Ashar/.gemini/antigravity-ide/brain/1a19a555-d433-4e9b-8f93-004a04a7f755/.user_uploaded/media_1788980965753.png';
const publicDir = path.join(__dirname, '../public');

fs.copyFileSync(src, path.join(publicDir, 'darpan-logo.png'));
fs.copyFileSync(src, path.join(publicDir, 'darpan-logo-full.png'));
console.log('Copied full logo to public/darpan-logo.png and public/darpan-logo-full.png');
