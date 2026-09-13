const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../src/app/layout.tsx');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  '"description": "National infrastructure project portfolio dashboard."\n  };',
  '"description": "National infrastructure project portfolio dashboard."\n  };\n\n  const breadcrumbLd = {\n    "@context": "https://schema.org/",\n    "@type": "BreadcrumbList",\n    "itemListElement": [{\n      "@type": "ListItem",\n      "position": 1,\n      "name": "Command Center",\n      "item": "https://darpan-monitor.in/"\n    },{\n      "@type": "ListItem",\n      "position": 2,\n      "name": "Projects",\n      "item": "https://darpan-monitor.in/projects"\n    }]\n  };'
);
c = c.replace(
  '<script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n        />',
  '<script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n        />\n        <script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}\n        />'
);
fs.writeFileSync(p, c);
