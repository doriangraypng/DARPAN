const fs = require('fs');
let code = fs.readFileSync('src/app/projects/[id]/page.tsx', 'utf8');

// 1. imports
if (!code.includes('framer-motion')) {
    code = code.replace(
      /import \{([^}]+)\} from "lucide-react";/,
      'import { $1 } from "lucide-react";\nimport { motion } from "framer-motion";'
    );
}

if (!code.includes('containerVariants')) {
  code = code.replace(/export default function ProjectDetailPage\(\) \{/, `
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function ProjectDetailPage() {`);
}

// 2. Wrap content
if (!code.includes('dash2-motion-container')) {
    code = code.replace(/<div className="dashboard-content pd">/, '<div className="dashboard-content pd">\n<motion.div variants={containerVariants} initial="hidden" animate="show" className="dash2-motion-container">');
    // Ensure closing motion.div inside closing main div.
    code = code.replace(/<\/div>\s*<\/section>\s*<\/main>/, '</motion.div>\n</div>\n      </section>\n    </main>');
}

// 3. Make the main sections motion.section
const sections = [
  'pd-hero', 'pd-status-strip', 'pd-panel', 'pd-modules'
];

sections.forEach(cls => {
  code = code.replace(new RegExp('<section className="' + cls + '">', 'g'), '<motion.section variants={itemVariants} className="' + cls + '">');
});
code = code.replace(/<div className="pd-modules">/g, '<motion.div variants={itemVariants} className="pd-modules">');
code = code.replace(/<\/div>\s*<\/motion.div>\s*<\/div>\s*<\/section>\s*<\/main>/, '</motion.div>\n</div>\n</motion.div>\n</div>\n      </section>\n    </main>');

// Replace </section> with </motion.section> for affected panels
code = code.replace(/<\/section>\s*(?=\s*\{?\/\*.*STATUS|RISK|FINANCIAL|PREDICTIVE|BENCHMARK|ANOMALY|WARNING|NEXT)/g, '</motion.section>\n');


fs.writeFileSync('src/app/projects/[id]/page.tsx', code);
