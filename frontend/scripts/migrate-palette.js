/**
 * Bulk color replacement script for DARPAN palette migration.
 * Maps ~200 hardcoded hex colors from cool blue-green palette to warm maroon/earth palette.
 */
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/app/globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// ── Color Mapping ──
// Cool blue-green → Warm maroon/earth
const replacements = [
  // ── Risk dot / legend / bar colors ──
  ['#b96359', '#ba1a1a'],   // critical dot/fill
  ['#c7954e', '#8a4d4b'],   // high dot/fill  
  ['#c6ad63', '#b47738'],   // medium dot/fill
  ['#62a088', '#565e74'],   // low dot/fill
  ['#b65d55', '#ba1a1a'],   // critical (legend, donut, risk-bar)
  ['#c99549', '#8a4d4b'],   // high (legend, donut, risk-bar)
  ['#c7ad62', '#b47738'],   // medium (legend, donut, risk-bar)
  ['#5d9c82', '#565e74'],   // low (legend, donut, risk-bar)
  ['#62a18a', '#565e74'],   // green accent (risk trend dot)
  ['#65a28b', '#565e74'],   // green accent fill variant
  ['#5d9c82', '#565e74'],   // green low (signal dot etc)

  // ── Blue/teal accent → secondary/primary ──
  ['#4e8291', '#565e74'],   // blue accent
  ['#4e8298', '#565e74'],   // blue accent chart
  ['#4f8298', '#565e74'],   // blue accent chart stroke
  ['#4f8a78', '#524342'],   // green-blue accent
  ['#4e7b80', '#524342'],   // teal accent
  ['#4f7d84', '#524342'],   // teal accent 
  ['#4f7e84', '#524342'],   // teal accent
  ['#4e777b', '#524342'],   // teal nav
  ['#397c94', '#8a4d4b'],   // darpan blue accent
  ['#4d879b', '#8a4d4b'],   // gradient start
  ['#275e72', '#6e3635'],   // dark blue accent
  ['#245e72', '#6e3635'],   // dark blue accent
  ['#274550', '#524342'],   // dark teal
  ['#294b56', '#524342'],   // dark teal
  ['#284a50', '#524342'],   // dark teal
  ['#284247', '#524342'],   // dark teal nav
  ['#29484d', '#524342'],   // dark teal
  ['#294b53', '#524342'],   // dark teal
  ['#477681', '#524342'],   // teal blue
  ['#476c76', '#524342'],   // teal blue
  ['#72929c', '#857372'],   // muted teal
  ['#789096', '#857372'],   // muted teal
  ['#789097', '#857372'],   // muted teal
  ['#78959f', '#857372'],   // muted teal
  ['#789199', '#857372'],   // muted teal
  ['#728990', '#857372'],   // muted teal
  ['#718589', '#857372'],   // muted teal
  ['#7d9699', '#857372'],   // muted teal
  ['#648894', '#857372'],   // muted teal
  ['#637e86', '#857372'],   // muted teal
  ['#6d858c', '#857372'],   // muted teal
  ['#7b9299', '#857372'],   // muted teal
  ['#71878d', '#857372'],   // muted teal
  ['#526e77', '#524342'],   // dark text
  ['#536e76', '#524342'],   // dark text
  ['#526d72', '#524342'],   // dark text
  ['#527074', '#524342'],   // dark text
  ['#587075', '#524342'],   // muted text
  ['#61787c', '#524342'],   // muted text
  ['#657b7f', '#524342'],   // muted text
  ['#5c8378', '#524342'],   // green text
  ['#466166', '#524342'],   // dark muted
  ['#466116', '#524342'],   // dark muted
  ['#42606a', '#524342'],   // dark muted
  ['#496b70', '#524342'],   // dark muted
  ['#4c666a', '#524342'],   // dark muted
  ['#4d676a', '#524342'],   // dark muted

  // ── Deep/dark text ──
  ['#17363c', '#1c1c18'],   // very dark teal → ink
  ['#17353b', '#1c1c18'],   // very dark teal → ink
  ['#18333d', '#1c1c18'],   // very dark teal → ink
  ['#18333a', '#1c1c18'],   // very dark teal → ink
  ['#19353c', '#1c1c18'],   // very dark teal → ink
  ['#19383e', '#1c1c18'],   // very dark teal → ink
  ['#173b48', '#1c1c18'],   // very dark teal → ink
  ['#183b49', '#1c1c18'],   // very dark teal → ink
  ['#23434d', '#1c1c18'],   // dark teal → ink
  ['#1d3137', '#1c1c18'],   // ink
  ['#273f43', '#1c1c18'],   // dark teal → ink
  ['#28464b', '#1c1c18'],   // dark teal → ink
  ['#29464b', '#1c1c18'],   // dark teal → ink
  ['#345b61', '#3f465c'],   // medium dark → secondary dark
  ['#3b5963', '#3f465c'],   // medium dark
  ['#3f7c70', '#3f465c'],   // medium green-teal
  ['#46675f', '#524342'],   // dark muted
  ['#46665f', '#524342'],   // dark muted

  // ── Light muted / captions ──
  ['#91a1a5', '#857372'],   // light muted
  ['#91a0a2', '#857372'],   // light muted
  ['#91a2a4', '#857372'],   // light muted
  ['#91a3a8', '#857372'],   // light muted
  ['#91a4a9', '#857372'],   // light muted
  ['#91a4aa', '#857372'],   // light muted
  ['#92a4a9', '#857372'],   // light muted
  ['#93a4a6', '#857372'],   // light muted
  ['#95a4a6', '#857372'],   // light muted
  ['#96a5a7', '#857372'],   // light muted
  ['#96564f', '#8a4d4b'],   // red muted
  ['#96a5a8', '#857372'],   // light muted
  ['#849496', '#857372'],   // light muted
  ['#84979a', '#857372'],   // light muted
  ['#8ba0a2', '#857372'],   // light muted
  ['#8ba0a6', '#857372'],   // light muted
  ['#8b9b9d', '#857372'],   // light muted
  ['#87999c', '#857372'],   // light muted
  ['#87999b', '#857372'],   // light muted
  ['#8a9b9e', '#857372'],   // light muted
  ['#8e514a', '#8a4d4b'],   // red muted
  ['#82979d', '#857372'],   // light muted
  ['#81969d', '#857372'],   // light muted
  ['#8ca1a7', '#857372'],   // light muted
  ['#8da2a8', '#857372'],   // light muted
  ['#8fa7ae', '#857372'],   // loading muted
  ['#98a6a8', '#857372'],   // light muted
  ['#98a6a5', '#857372'],   // light muted
  ['#99a6a8', '#857372'],   // light muted
  ['#99aaac', '#857372'],   // light muted
  ['#9aabb0', '#857372'],   // light muted
  ['#9aabad', '#857372'],   // light muted
  ['#9aa7a8', '#857372'],   // light muted
  ['#9aa8aa', '#857372'],   // light muted
  ['#9ba8a9', '#857372'],   // light muted
  ['#9cabad', '#857372'],   // light muted
  ['#a0adaf', '#857372'],   // light muted
  ['#a1adaf', '#857372'],   // light muted
  ['#a3b2b6', '#857372'],   // light muted
  ['#a6b5b9', '#857372'],   // light muted
  ['#a08f8c', '#857372'],   // warm muted
  ['#b7c4c8', '#d7c2c0'],   // very light muted

  // ── Red / warning / danger accents ──
  ['#a45b53', '#ba1a1a'],   // red accent
  ['#a84c48', '#93000a'],   // red accent dark
  ['#a65b53', '#ba1a1a'],   // red accent
  ['#aa5a52', '#ba1a1a'],   // red accent
  ['#a54d49', '#ba1a1a'],   // red accent  (in case still present elsewhere)
  ['#a36c35', '#b47738'],   // amber accent
  ['#a98946', '#b47738'],   // amber
  ['#a4524a', '#ba1a1a'],   // red
  ['#9d514a', '#8a4d4b'],   // red muted
  ['#9e514a', '#8a4d4b'],   // red muted
  ['#9e6731', '#b47738'],   // amber muted
  ['#9c413e', '#93000a'],   // critical dark
  ['#b7574b', '#ba1a1a'],   // high red
  ['#b38842', '#b47738'],   // medium amber
  ['#437d65', '#3f465c'],   // low green (pill)
  ['#ad5c53', '#ba1a1a'],   // red accent
  ['#b07b3d', '#b47738'],   // amber accent
  ['#9b6b65', '#857372'],   // warm muted 
  ['#9b5f58', '#8a4d4b'],   // red muted
  ['#a6534b', '#ba1a1a'],   // red

  // ── Green accents ──
  ['#63917e', '#565e74'],   // green muted
  ['#4f806c', '#565e74'],   // green muted
  ['#4d7e69', '#565e74'],   // green muted
  ['#78a09b', '#565e74'],   // green light muted
  ['#467963', '#3f465c'],   // green dark
  ['#4b6a82', '#3f465c'],   // teal dark

  // ── Medium amber ──
  ['#8f7a3c', '#b47738'],   // amber
  ['#8b7634', '#b47738'],   // amber

  // ── Background / panel / surface colors ──
  ['#edf2f1', '#ebe8e1'],   // light panel bg
  ['#edf2f2', '#ebe8e1'],   // light panel bg
  ['#f0dfdb', '#DFDBD2'],   // warning border
  ['#fffaf8', '#fcf9f2'],   // warm white panel
  ['#eedfdb', '#DFDBD2'],   // warning border
  ['#f6faf9', '#f6f3ec'],   // soft bg
  ['#eaf3f1', '#f1eee7'],   // teal bg → surface container
  ['#eaf3f2', '#f1eee7'],   // teal bg → surface container
  ['#eaf3f6', '#f1eee7'],   // teal bg → surface container
  ['#e8f3ee', '#f1eee7'],   // green bg → surface container
  ['#f2f8f6', '#f6f3ec'],   // light green bg
  ['#f8e8e5', '#ffdad6'],   // red light bg → error container
  ['#f8e7e4', '#ffdad6'],   // red light bg → error container
  ['#f9e9e6', '#ffdad6'],   // red light bg → error container
  ['#faeae7', '#ffdad6'],   // red light bg → error container
  ['#fbefdf', '#f1eee7'],   // amber light bg
  ['#f7f1dd', '#f1eee7'],   // yellow light bg
  ['#f7fbfa', '#f6f3ec'],   // very light bg
  ['#dce9e6', '#DFDBD2'],   // green border
  ['#dce8e6', '#DFDBD2'],   // green border
  ['#dbe8e6', '#DFDBD2'],   // green border
  ['#d9e8e5', '#DFDBD2'],   // green border
  ['#c9dada', '#d7c2c0'],   // muted border
  ['#c9ddda', '#d7c2c0'],   // muted border
  ['#cadbd9', '#d7c2c0'],   // muted border dashed
  ['#eadfdd', '#DFDBD2'],   // warm border
  ['#dbe9e5', '#DFDBD2'],   // green border (sidebar)
  ['#c9d5d6', '#d7c2c0'],   // pale border

  // ── Panel / card backgrounds ──
  ['#eaf0ef', '#ebe8e1'],   // card bg
  ['#eaeff0', '#ebe8e1'],   // card bg hover
  ['#e4edef', '#ebe8e1'],   // card bg

  // ── Risk badge / pill backgrounds ──
  ['#faefef', '#ffdad6'],   // critical pill bg
  ['#fff0ec', '#ffdad6'],   // high pill bg
  ['#fdf5e7', '#f1eee7'],   // medium pill bg
  ['#ebf6f1', '#f1eee7'],   // low pill bg
  ['#f2f9f6', '#f6f3ec'],   // positive insight bg
  ['#fdf5f4', '#ffdad6'],   // negative insight bg
  ['#fdf3f2', '#ffdad6'],   // negative insight bg
  ['#eef7f3', '#f1eee7'],   // positive insight bg

  // ── Gradient progress bars ──
  // (these need to use the new primary → secondary)

  // ── Dashboard V2 (darpan) section colors ──
  ['#eef5f7', '#f1eee7'],   // darpan bg
  ['#e7f1f4', '#ebe8e1'],   // darpan bg soft
  ['#f9fcfd', '#fcf9f2'],   // darpan panel
  ['#f2f8fa', '#f6f3ec'],   // darpan panel blue
  ['#bfd8e0', '#d7c2c0'],   // darpan blue soft
  ['#d4e4e8', '#DFDBD2'],   // darpan border
  ['#f5fafb', '#f6f3ec'],   // gradient start
  ['#edf5f7', '#f1eee7'],   // gradient end
  ['#dcecf1', '#DFDBD2'],   // border gradient
  ['#eaf4f6', '#f1eee7'],   // border gradient end
  ['#e5f1f4', '#ebe8e1'],   // bg
  ['#e3f0f3', '#ebe8e1'],   // bg hover
  ['#e1ecef', '#e5e2db'],   // bg strong
  ['#edf6f8', '#f6f3ec'],   // card bg
  ['#e8f4f5', '#f1eee7'],   // gradient
  ['#f1f8f9', '#f6f3ec'],   // gradient end
  ['#cfe1e6', '#d7c2c0'],   // border
  ['#cfe3e7', '#d7c2c0'],   // border
  ['#d2e3e7', '#d7c2c0'],   // border
  ['#bcd6de', '#d7c2c0'],   // border active
  ['#cbd8d9', '#d7c2c0'],   // border
  ['#f1f6f8', '#f6f3ec'],   // bg
  ['#f8fbfc', '#fcf9f2'],   // bg light
  ['#d9e7ea', '#DFDBD2'],   // border
  ['#d8e7ea', '#DFDBD2'],   // border
  ['#d6e5e8', '#DFDBD2'],   // border
  ['#d6e4e8', '#DFDBD2'],   // border
  ['#d7e5e8', '#DFDBD2'],   // border
  ['#d9e6e9', '#DFDBD2'],   // border
  ['#e1ebed', '#DFDBD2'],   // border
  ['#e7eef0', '#ebe8e1'],   // border/bg
  ['#f2f8fa', '#f6f3ec'],   // panel bg
  ['#e7f1f4', '#ebe8e1'],   // active bg
  ['#f0f7f8', '#f6f3ec'],   // card bg
  ['#f2dfda', '#ffdad6'],   // red bg
  ['#f0f5f8', '#f1eee7'],   // blue light bg
  ['#f0f4f5', '#f1eee7'],   // neutral bg
  ['#e4f0f3', '#ebe8e1'],   // tag bg
  ['#fbfdfe', '#fcf9f2'],   // card bg
  ['#dfeef2', '#ebe8e1'],   // hover bg
  ['#e8eef0', '#ebe8e1'],   // track bg
  ['#e4edef', '#ebe8e1'],   // track bg
  ['#ead6d2', '#d7c2c0'],   // danger border

  // ── Loading spinner ──
  ['#dce8eb', '#DFDBD2'],   // spinner bg border
];

// Apply all replacements (case-insensitive)
let count = 0;
for (const [from, to] of replacements) {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = css.match(regex);
  if (matches) {
    count += matches.length;
    css = css.replace(regex, to);
  }
}

// ── Also fix gradient references that use the old palette ──
// linear-gradient(90deg, #4f8298, #62a18a) → (90deg, var(--high), var(--blue))
css = css.replace(
  /linear-gradient\(90deg,\s*var\(--blue\),\s*var\(--green\)\)/g,
  'linear-gradient(90deg, var(--high), var(--blue))'
);

// ── Fix the darpan- variables section ──
css = css.replace('--darpan-bg: #f1eee7', '--darpan-bg: #f1eee7');
css = css.replace('--darpan-bg-soft: #ebe8e1', '--darpan-bg-soft: #ebe8e1');
css = css.replace('--darpan-panel: #fcf9f2', '--darpan-panel: #fcf9f2');
css = css.replace('--darpan-panel-blue: #f6f3ec', '--darpan-panel-blue: #f6f3ec');
css = css.replace('--darpan-blue: #565e74', '--darpan-blue: #8a4d4b');
css = css.replace('--darpan-blue-dark: #1c1c18', '--darpan-blue-dark: #2f0608');
css = css.replace('--darpan-blue-soft: #d7c2c0', '--darpan-blue-soft: #d7c2c0');
css = css.replace('--darpan-green: #565e74', '--darpan-green: #565e74');
css = css.replace('--darpan-text: #1c1c18', '--darpan-text: #1c1c18');
css = css.replace('--darpan-muted: #857372', '--darpan-muted: #857372');
css = css.replace('--darpan-border: #DFDBD2', '--darpan-border: #DFDBD2');

// Fix gradient in projects
css = css.replace(
  /linear-gradient\(90deg,\s*#8a4d4b,\s*#565e74\)/g,
  'linear-gradient(90deg, var(--high), var(--blue))'
);
css = css.replace(
  /linear-gradient\(\s*135deg,\s*#8a4d4b,\s*#565e74\s*\)/g,
  'linear-gradient(135deg, var(--high), var(--blue))'
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log(`Replaced ${count} color instances in globals.css`);
