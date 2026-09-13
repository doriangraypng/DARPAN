const fs = require('fs');
let code = fs.readFileSync('src/app/investigation/page.tsx', 'utf8');

const summaryTileIdx = code.indexOf('function SummaryTile(');
const sidebarIdx = code.indexOf('function InvestigationSidebar');

if (summaryTileIdx > -1 && sidebarIdx > -1) {
  const newSummary = `function SummaryTile({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <SpotlightCard
      spotlightColor={danger ? "rgba(169, 77, 77, 0.2)" : "rgba(255, 255, 255, 0.15)"}
      className={\`inv-tile \${danger ? "danger" : ""}\`}
    >
      <div className="inv-tile-icon">{icon}</div>
      <div>
        <strong>
          <AnimatedCounter value={value} />
        </strong>
        <span>{label}</span>
      </div>
    </SpotlightCard>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

`;
  code = code.substring(0, summaryTileIdx) + newSummary + code.substring(sidebarIdx);
}

fs.writeFileSync('src/app/investigation/page.tsx', code);
