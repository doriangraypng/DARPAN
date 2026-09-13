const fs = require('fs');
let code = fs.readFileSync('src/app/projects/page.tsx', 'utf8');

// 1. imports
code = code.replace(
  /import \{([^}]+)\} from "lucide-react";/,
  'import { $1 } from "lucide-react";\nimport { motion } from "framer-motion";'
);

if (!code.includes('containerVariants')) {
  code = code.replace(/export default function ProjectsPage\(\) \{/, `
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
};

export default function ProjectsPage() {`);
}

// 2. Wrap project list with motion.div
code = code.replace(/<div className="projects-list">/, '<motion.div variants={containerVariants} initial="hidden" animate="show" className="projects-list">');
code = code.replace(/<\/div>\s*\}\s*<\/section>/, '</motion.div>\n            )}\n\n        </section>');

// 3. Wrap row Component
if (!code.includes('const MotionLink = motion.create(Link);')) {
  code = code.replace(/function ProjectRow\(\{/, `const MotionLink = motion.create(Link);\n\nfunction ProjectRow({`);
  
  code = code.replace(
    /<Link\s+href=\{`\/projects\/\$\{project.id\}`\}\s+className="project-row"\s*>/,
    '<MotionLink variants={itemVariants} href={`/projects/${project.id}`} className="project-row">'
  );
  code = code.replace(/<\/Link>\s*\);\s*\}/, '</MotionLink>\n  );\n}');
}

fs.writeFileSync('src/app/projects/page.tsx', code);
