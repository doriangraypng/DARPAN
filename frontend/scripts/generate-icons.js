const fs = require('fs');
const path = require('path');

async function main() {
  const sharp = require('sharp');
  const src = 'C:/Users/Harsh Ashar/.gemini/antigravity-ide/brain/1a19a555-d433-4e9b-8f93-004a04a7f755/.user_uploaded/media_1788980965753.png';
  const publicDir = path.join(__dirname, '../public');

  // Copy as darpan-logo-full.png
  fs.copyFileSync(src, path.join(publicDir, 'darpan-logo-full.png'));

  // Extract emblem (the circular target reticle with letter 'da')
  // The emblem is from y=100 to y=560, x=250 to x=770
  // Let's get exact bounding box of non-transparent pixels in top region
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  
  let eMinX = info.width, eMaxX = 0, eMinY = info.height, eMaxY = 0;
  for (let y = 90; y <= 570; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 10) {
        if (x < eMinX) eMinX = x;
        if (x > eMaxX) eMaxX = x;
        if (y < eMinY) eMinY = y;
        if (y > eMaxY) eMaxY = y;
      }
    }
  }

  const ew = eMaxX - eMinX + 1;
  const eh = eMaxY - eMinY + 1;
  const pad = 16;
  const size = Math.max(ew, eh) + pad * 2;
  const cx = Math.round((eMinX + eMaxX) / 2);
  const cy = Math.round((eMinY + eMaxY) / 2);
  const left = Math.max(0, cx - Math.round(size / 2));
  const top = Math.max(0, cy - Math.round(size / 2));
  const finalSize = Math.min(size, info.width - left, info.height - top);

  await sharp(src)
    .extract({ left, top, width: finalSize, height: finalSize })
    .toFile(path.join(publicDir, 'darpan-emblem.png'));

  // Also create apple-icon and favicon
  await sharp(path.join(publicDir, 'darpan-emblem.png'))
    .resize(180, 180)
    .toFile(path.join(__dirname, '../src/app/apple-icon.png'));

  console.log('Successfully generated darpan-emblem.png and apple-icon.png');
}

main().catch(err => console.error(err));
