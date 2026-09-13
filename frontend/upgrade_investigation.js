const fs = require('fs');
let code = fs.readFileSync('src/app/investigation/page.tsx', 'utf8');

// Imports
if (!code.includes('import AnimatedCounter')) {
  code = code.replace(
    'import { getProjects } from "@/lib/api";',
    'import { getProjects } from "@/lib/api";\nimport AnimatedCounter from "@/components/ui/animated-counter";\nimport { SpotlightCard } from "@/components/ui/spotlight-card";\nimport { motion } from "framer-motion";'
  );
}

// Remove duplicate motion if needed (but currently missing from investigation except manually added above)
// Wait, is 'import { motion } from "framer-motion";' already there? Yes, if so we don't need to add it twice.
// Let's just do a blanket regex to remove duplicate motion imports
code = code.replace(/import \{ motion \} from "framer-motion";\nimport \{ motion \} from "framer-motion";/, 'import { motion } from "framer-motion";');

// Variants
code = code.replace(
  'export default function InvestigationPage() {',
  'const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };\nconst itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: {} as any } };\n\nexport default function InvestigationPage() {'
);

// Motion wrappings
code = code.replace(
  '<div className="dashboard-content inv">',
  '<div className="dashboard-content inv">\n          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "contents" }}>'
);
code = code.replace(
  /<\/div>\n      <\/section>/,
  '</motion.div>\n        </div>\n      </section>'
);

// Stagger sections
code = code.replace(
  /<section className="inv-intro">/g,
  '<motion.section variants={itemVariants} className="inv-intro">'
);
code = code.replace(
  /<\/div>\n            <\/section>/g,
  '</div>\n            </motion.section>'
);

code = code.replace(
  /<section className="inv-controls">/g,
  '<motion.section variants={itemVariants} className="inv-controls">'
);
code = code.replace(
  /<\/div>\n          <\/section>/,
  '</div>\n          </motion.section>'
);

code = code.replace(
  /<section className="inv-feed">/g,
  '<motion.section variants={itemVariants} className="inv-feed">'
);

// SummaryTile modification
code = code.replace(
  /\{value\.toLocaleString\("en-IN"\)\}/g,
  '<AnimatedCounter value={value} />'
);

code = code.replace(
  /className=\{`inv-tile \$\{danger \? "danger" : ""\}`\}/g,
  'className={`inv-tile ${danger ? "danger" : ""}`}'
);
code = code.replace(
  /function SummaryTile\(\{([\s\S]*?)danger = false,\n\}: \{([\s\S]*?)\}\) \{([\s\S]*?)<div\s*className=\{`inv-tile \$\{danger \? "danger" : ""\}`\}>/,
  'function SummaryTile({$1danger = false,\n}: {$2}) {$3<SpotlightCard\n      spotlightColor={danger ? "rgba(169, 77, 77, 0.2)" : "rgba(255, 255, 255, 0.15)"}\n      className={`inv-tile ${danger ? "danger" : ""}`}\n    >'
);
code = code.replace(
  /<\/div>\n    <\/div>/,
  '</div>\n    </SpotlightCard>'
);

// SignalCard Modification
code = code.replace(
  /function SignalCard\((\{ signal \}: \{ signal: Signal \})\) \{/,
  'const MotionArticle = motion.create("article");\n\nfunction SignalCard($1) {'
);
code = code.replace(
  /<article\n\s*className=\{\`inv-signal pd-risk--\$\{signal\.severity\}\`\}\n\s*>/g,
  '<MotionArticle variants={itemVariants} className={`inv-signal pd-risk--${signal.severity} relative overflow-hidden`}><SpotlightCard className="h-full w-full absolute inset-0 z-0 pointer-events-none" spotlightColor={signal.severity === "critical" ? "rgba(169,77,77,0.15)" : "rgba(255,255,255,0.08)"} />'
);
code = code.replace(
  /Open project →\n\s*<\/Link>\n\s*<\/article>/,
  'Open project →\n      </Link>\n    </MotionArticle>'
);

fs.writeFileSync('src/app/investigation/page.tsx', code);
