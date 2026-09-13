const fs = require('fs');
let code = fs.readFileSync('src/app/warnings/page.tsx', 'utf8');

// 1. imports
if (!code.includes('framer-motion')) {
    code = code.replace(
      /import \{([^}]+)\} from "lucide-react";/,
      'import { $1 } from "lucide-react";\nimport { motion } from "framer-motion";\nimport Image from "next/image";'
    );
}

if (!code.includes('containerVariants')) {
  code = code.replace(/export default function EarlyWarningsPage\(\) \{/, `
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function EarlyWarningsPage() {`);
}

// Ensure the new Sidebar is injected replacing the old sidebar
const newSidebar = `
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo-wrap">
            <Image
              src="/darpan-logo.png"
              alt="DARPAN"
              width={48}
              height={48}
              priority
              className="darpan-logo"
            />
          </div>
          <div>
            <div className="brand-name">DARPAN</div>
            <div className="brand-subtitle">Infrastructure Intelligence</div>
          </div>
        </div>

        <div className="sidebar-section-label">COMMAND CENTER</div>

        <nav className="sidebar-nav">
          <Link href="/" className="nav-item">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>

          <Link href="/projects" className="nav-item">
            <Building2 size={18} />
            <span>Projects</span>
          </Link>

          <div className="nav-item nav-active">
            <AlertTriangle size={18} />
            <span>Early Warnings</span>
            {criticalCount > 0 && (
              <span className="nav-count">{criticalCount}</span>
            )}
          </div>

          <Link href="/investigation" className="nav-item">
            <ShieldAlert size={18} />
            <span>Investigation</span>
          </Link>
        </nav>

        <div className="sidebar-spacer" />

        <div className="system-status">
          <div className="status-pulse"><span /></div>
          <div>
            <div className="status-title">Analytics engine</div>
            <div className="status-value">Operational</div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-symbol">D</div>
          <div>
            <div className="footer-name">DARPAN v0.1</div>
            <div className="footer-text">Predictive monitoring</div>
          </div>
        </div>
      </aside>
`;

const sidebarRegex = /<aside className="sidebar">[\s\S]*?<\/aside>/;
code = code.replace(sidebarRegex, newSidebar);

// Add motion structure
code = code.replace(/<div className="dashboard-content warnings-page">/, '<div className="dashboard-content warnings-page">\n<motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "contents" }}>');
code = code.replace(/<\/div>\s*<\/section>\s*<\/main>/, '</motion.div>\n</div>\n      </section>\n    </main>');

// Replace sections
code = code.replace(/<section className="warnings-intro">/g, '<motion.section variants={itemVariants} className="warnings-intro">');
code = code.replace(/<section className="warning-summary-grid">/g, '<motion.section variants={itemVariants} className="warning-summary-grid">');
code = code.replace(/<section className="warnings-controls">/g, '<motion.section variants={itemVariants} className="warnings-controls">');
code = code.replace(/<section className="warning-feed">/g, '<motion.section variants={itemVariants} className="warning-feed">');

// End motion sections gracefully
code = code.replace(/<\/section>\s*(?=\s*\{\/\*\s*=====================================\s*(SUMMARY|SEARCH|WARNING LIST))/g, '</motion.section>\n');
// Finally close the last section feed
code = code.replace(/<\/section>\s*(?=\s*<\/motion\.div>)/, '</motion.section>\n');

// Also modify WarningCard to animate inside feed
if (!code.includes('const MotionArticle = motion.create("article");')) {
  code = code.replace(/function WarningCard\(\{/, 'const MotionArticle = motion.create("article");\n\nfunction WarningCard({');
  code = code.replace(/<article\s+className=\{`(warning-card)/, '<MotionArticle variants={itemVariants} className={`$1');
  code = code.replace(/<\/article>/, '</MotionArticle>');
}

fs.writeFileSync('src/app/warnings/page.tsx', code);
