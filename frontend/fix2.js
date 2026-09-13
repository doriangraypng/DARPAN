const fs = require('fs');

// Fix projects/[id]/page.tsx
let id = fs.readFileSync('src/app/projects/[id]/page.tsx', 'utf8');

id = id.replace(/<\/section>\s*\{\/\*\s*RISK \+ EXECUTION\s*\*\/\}/, '</motion.section>\n\n          {/* RISK + EXECUTION */}');
id = id.replace(/<\/section>\s*\{\/\*\s*FINANCIAL POSITION\s*\*\/\}/g, '</motion.section>\n\n          {/* FINANCIAL POSITION */}');
id = id.replace(/<\/section>\s*\{\/\*\s*PREDICTIVE INTELLIGENCE\s*\*\/\}/g, '</motion.section>\n\n          {/* PREDICTIVE INTELLIGENCE */}');
id = id.replace(/<\/section>\s*\{\/\*\s*BENCHMARK \+ ANOMALY\s*\*\/\}/g, '</motion.section>\n\n          {/* BENCHMARK + ANOMALY */}');
id = id.replace(/<\/section>\s*\{\/\*\s*ANOMALY SIGNALS\s*\*\/\}/g, '</motion.section>\n\n            {/* ANOMALY SIGNALS */}');
id = id.replace(/<\/section>\s*\{\/\*\s*WARNING REGISTER\s*\*\/\}/g, '</motion.section>\n\n          {/* WARNING REGISTER */}');
id = id.replace(/<\/section>\s*\{\/\*\s*NEXT MODULES\s*\*\/\}/g, '</motion.section>\n\n          {/* NEXT MODULES */}');
id = id.replace(/<\/section>\s*(?=\s*<\/div>\s*\{\/\* WARNING REGISTER)/, '</motion.section>\n');

fs.writeFileSync('src/app/projects/[id]/page.tsx', id);


// Fix projects/page.tsx
let p = fs.readFileSync('src/app/projects/page.tsx', 'utf8');

p = p.replace(
`  return (
    <Link
      href={\`/projects/\${project.id}\`}
      className="project-row"
    >`,
`  return (
    <MotionLink
      variants={itemVariants}
      href={\`/projects/\${project.id}\`}
      className="project-row"
    >`
);

fs.writeFileSync('src/app/projects/page.tsx', p);
