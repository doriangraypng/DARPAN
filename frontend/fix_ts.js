const fs = require('fs');

// Fix type: "spring" -> "tween" or just remove type as it's causing generic TS union issues when not strictly typed.
// Let's just remove `type: "spring"` and let framer-motion use the default spring.
// Or we cast `as any`.
function fixVariants(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/transition: \{ type: "spring", stiffness: \d+ \}/g, 'transition: {} as any');
  
  // Also check imports for lucide-react if they got mangled.
  if (path.includes('projects/page.tsx') || path.includes('projects/[id]/page.tsx') || path.includes('warnings/page.tsx')) {
    // If we're missing ChevronRight in projects/page.tsx, let's just make sure all of them are imported.
    const allIcons = ['AlertTriangle', 'ArrowUpDown', 'Building2', 'ChevronRight', 'Search', 'ShieldCheck', 'SlidersHorizontal', 'TrendingDown', 'TrendingUp', 'X', 'ArrowLeft', 'CheckCircle2', 'Clock3', 'IndianRupee', 'MapPin', 'ShieldAlert', 'BarChart3'];
    
    // Quickest way is to just replace the first lucide-react import completely, or prepend.
    if (!code.includes('ChevronRight')) {
        code = code.replace(/import \{.*?\} from "lucide-react";/s, `import { ${allIcons.join(', ')} } from "lucide-react";`);
    } else {
        code = code.replace(/import \{.*?\} from "lucide-react";/s, `import { ${allIcons.join(', ')} } from "lucide-react";`);
    }
  }

  fs.writeFileSync(path, code);
}

fixVariants('src/app/page.tsx');
fixVariants('src/app/projects/page.tsx');
fixVariants('src/app/projects/[id]/page.tsx');
fixVariants('src/app/warnings/page.tsx');

