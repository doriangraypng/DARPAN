const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Imports
if (!code.includes('import AnimatedCounter')) {
  code = code.replace(
    'import { getProjects } from "@/lib/api";',
    'import { getProjects } from "@/lib/api";\nimport AnimatedCounter from "@/components/ui/animated-counter";\nimport { SpotlightCard } from "@/components/ui/spotlight-card";'
  );
}

// KPI Card Spotlight Wrapper
code = code.replace(
  /<article\n\s*className=\{\`dash2-kpi \$\{\n\s*danger \? "danger" : ""\n\s*\}\`\}\n\s*>/g,
  '<SpotlightCard\n      spotlightColor={danger ? "rgba(169, 77, 77, 0.2)" : "rgba(94, 155, 131, 0.15)"}\n      className={`dash2-kpi ${danger ? "danger" : ""}`}\n    >'
);
code = code.replace(
  /<\/div>\n\n    <\/article>/g,
  '</div>\n\n    </SpotlightCard>'
);
code = code.replace(
  /<\/article>/g,
  '</SpotlightCard>' 
);

// Animated Counters inside dashboard KPI Cards
code = code.replace(
  /projects\.length\.toLocaleString\("en-IN"\)/,
  '<AnimatedCounter value={projects.length} />'
);
code = code.replace(
  /\(\s*criticalProjects\.length \+\s*highRiskProjects\.length\s*\)\.toLocaleString\("en-IN"\)/,
  '<AnimatedCounter value={criticalProjects.length + highRiskProjects.length} />'
);
code = code.replace(
  /formatCrore\(costExposure\)/,
  '<AnimatedCounter value={costExposure} prefix="₹" suffix=" Cr" />'
);
code = code.replace(
  /value=\{\n\s*loading\n\s*\?\s*"—"\n\s*:\s*criticalProjects\.length\n\s*\}/,
  'value={loading ? "—" : <AnimatedCounter value={criticalProjects.length} />}'
);

code = code.replace(
  /className="dash2-action-card"\n\s*>/g,
  'className="dash2-action-card overflow-hidden relative"\n            >\n              <SpotlightCard className="h-full w-full flex flex-col justify-center p-6 border-0 w-full" spotlightColor="rgba(255, 255, 255, 0.05)">'
);
code = code.replace(/<\/b>\n\s*<\/Link>/g, '</b>\n              </SpotlightCard>\n            </Link>');


fs.writeFileSync('src/app/page.tsx', code);
