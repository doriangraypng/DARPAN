const sharp = require('sharp');
const path = require('path');

async function createBanner() {
  const width = 3168;
  const height = 1344;

  // Create an SVG with subtle architectural lines/grid in the new warm palette (#DFDBD2, #8a4d4b, #565e74)
  const svgGrid = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="smallGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(223, 219, 210, 0.45)" stroke-width="1"/>
      </pattern>
      <pattern id="grid" width="240" height="240" patternUnits="userSpaceOnUse">
        <rect width="240" height="240" fill="url(#smallGrid)"/>
        <path d="M 240 0 L 0 0 0 240" fill="none" stroke="rgba(215, 194, 192, 0.55)" stroke-width="1.5"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="transparent"/>
    <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.7"/>
    <!-- Subtle technical radar / surveying circles on the right -->
    <circle cx="2350" cy="672" r="600" fill="none" stroke="rgba(138, 77, 75, 0.12)" stroke-width="2" stroke-dasharray="8,8"/>
    <circle cx="2350" cy="672" r="450" fill="none" stroke="rgba(138, 77, 75, 0.15)" stroke-width="1.5"/>
    <circle cx="2350" cy="672" r="300" fill="none" stroke="rgba(86, 94, 116, 0.15)" stroke-width="1.5" stroke-dasharray="12,6"/>
    <circle cx="2350" cy="672" r="150" fill="none" stroke="rgba(138, 77, 75, 0.2)" stroke-width="1"/>
    <line x1="1650" y1="672" x2="3050" y2="672" stroke="rgba(138, 77, 75, 0.15)" stroke-width="1"/>
    <line x1="2350" y1="0" x2="2350" y2="1344" stroke="rgba(138, 77, 75, 0.15)" stroke-width="1"/>
  </svg>
  `;

  // Resize user logo to fit prominently on the right
  const logoSize = 1000;
  const resizedLogo = await sharp('public/darpan-logo.png')
    .resize(logoSize, logoSize, { fit: 'contain' })
    .toBuffer();

  const gridBuffer = Buffer.from(svgGrid);

  // Composite grid and logo onto transparent canvas
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 252, g: 249, b: 242, alpha: 0 }
    }
  })
  .composite([
    { input: gridBuffer, top: 0, left: 0 },
    { input: resizedLogo, top: Math.round((height - logoSize) / 2), left: 2350 - Math.round(logoSize / 2) }
  ])
  .png()
  .toFile('public/darpan-banner.png');

  console.log('Successfully created public/darpan-banner.png with new branding!');
}

createBanner().catch(console.error);
