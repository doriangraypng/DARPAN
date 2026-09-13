const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert BackgroundPaths import
if (!code.includes('import { BackgroundPaths }')) {
  code = code.replace(
    'import { SpotlightCard } from "@/components/ui/spotlight-card";',
    'import { SpotlightCard } from "@/components/ui/spotlight-card";\nimport { BackgroundPaths } from "@/components/ui/background-paths";'
  );
}

// Add BackgroundPaths into the Hero section visually
code = code.replace(
  '<motion.section variants={itemVariants} className="dash2-hero">',
  '<motion.section variants={itemVariants} className="dash2-hero relative overflow-hidden">\n            <div className="absolute inset-0 z-0 opacity-30"><BackgroundPaths /></div>\n            <div className="relative z-10 w-full h-full flex flex-col justify-between">'
);

// Close the inner wrapper for hero copy
code = code.replace(
  /<div className="dash2-snapshot">\s*<span className="dash2-live-dot" \/>\s*<span>Data snapshot<\/span>\s*<strong>April 2026<\/strong>\s*<\/div>\s*<\/motion\.section>/,
  '<div className="dash2-snapshot">\n              <span className="dash2-live-dot" />\n              <span>Data snapshot</span>\n              <strong>April 2026</strong>\n            </div>\n            </div>\n\n          </motion.section>'
);

fs.writeFileSync('src/app/page.tsx', code);
