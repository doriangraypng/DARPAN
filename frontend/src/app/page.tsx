"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  ShieldAlert,
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: {} as any }
};

import { getProjects } from "@/lib/api";
import AnimatedCounter from "@/components/ui/animated-counter";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Project } from "@/types/project";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const data = await getProjects();

        if (mounted) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const criticalProjects = useMemo(
    () => projects.filter((p) => p.risk.level === "critical"),
    [projects]
  );

  const highRiskProjects = useMemo(
    () => projects.filter((p) => p.risk.level === "high"),
    [projects]
  );

  const mediumProjects = useMemo(
    () => projects.filter((p) => p.risk.level === "medium"),
    [projects]
  );

  const lowProjects = useMemo(
    () => projects.filter((p) => p.risk.level === "low"),
    [projects]
  );

  const averageRisk = useMemo(() => {
    if (!projects.length) return 0;

    return Math.round(
      projects.reduce((sum, p) => sum + p.risk.overall, 0) /
        projects.length
    );
  }, [projects]);

  const totalApprovedCost = useMemo(
    () =>
      projects.reduce(
        (sum, p) => sum + p.financial.approvedCost,
        0
      ),
    [projects]
  );

  const totalRevisedCost = useMemo(
    () =>
      projects.reduce(
        (sum, p) => sum + p.financial.revisedCost,
        0
      ),
    [projects]
  );

  const costExposure = totalRevisedCost - totalApprovedCost;

  const priorityProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => b.risk.overall - a.risk.overall)
        .slice(0, 4),
    [projects]
  );

  const riskCounts = {
    critical: criticalProjects.length,
    high: highRiskProjects.length,
    medium: mediumProjects.length,
    low: lowProjects.length,
  };

  return (
    <main className="darpan-app">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <DashboardSidebar
          criticalCount={criticalProjects.length}
        />
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <section className="main-area">

        {/* TOP HEADER */}

        <header className="top-header">
          <div className="top-header-title">
            <span>DARPAN / NATIONAL PORTFOLIO</span>
            <strong>Infrastructure Intelligence</strong>
          </div>

          <div className="header-actions">
            <div className="data-refresh">
              <div className="refresh-dot" />
              <span>Data snapshot</span>
              <strong>July 2026</strong>
            </div>
          </div>
        </header>

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        <div className="dashboard-content dashboard-v2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="dash2-motion-container"
          >

          {/* =================================================
              HERO
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-hero relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30"><BackgroundPaths /></div>
            <div className="relative z-10 w-full h-full flex flex-col justify-between">

            <div className="dash2-hero-copy">

              <div className="dash2-eyebrow">
                <span />
                LIVE PORTFOLIO INTELLIGENCE
              </div>

              <h1>
                See the risk.{" "}
                <span>Before it becomes a crisis.</span>
              </h1>

              <p>
                A consolidated view of infrastructure project health,
                emerging risk and intervention priorities.
              </p>

            </div>

            {/* BRAND BANNER */}

            <div className="dash2-brand-banner">
              <Image
                src="/darpan-banner.png"
                alt="DARPAN Infrastructure Intelligence"
                fill
                priority
                sizes="420px"
                className="dash2-brand-banner-image"
              />

              <div className="dash2-banner-overlay" />
            </div>

            <div className="dash2-snapshot">
              <span className="dash2-live-dot" />
              <span>Data snapshot</span>
              <strong>July 2026</strong>
            </div>
            </div>

          </motion.section>{/* =================================================
              KPI CARDS
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-kpis">

            <KpiCard
              icon={<Building2 size={19} />}
              label="Total projects"
              value={
                loading
                  ? "—"
                  : <AnimatedCounter value={projects.length} />
              }
              helper="Current monitored portfolio"
            />

            <KpiCard
              icon={<ShieldAlert size={19} />}
              label="High-risk projects"
              value={
                loading
                  ? "—"
                  : <AnimatedCounter value={criticalProjects.length + highRiskProjects.length} />
              }
              helper={
                projects.length
                  ? `${Math.round(
                      ((criticalProjects.length +
                        highRiskProjects.length) /
                        projects.length) *
                        100
                    )}% of monitored portfolio`
                  : "Portfolio risk"
              }
            />

            <KpiCard
              icon={<IndianRupee size={19} />}
              label="Cost exposure"
              value={
                loading
                  ? "—"
                  : <AnimatedCounter value={costExposure} prefix="₹" suffix=" Cr" />
              }
              helper="Revised minus approved cost"
            />

            <KpiCard
              icon={<AlertTriangle size={19} />}
              label="Active warnings"
              value={loading ? "—" : <AnimatedCounter value={criticalProjects.length} />}
              helper="Require monitoring attention"
              danger={criticalProjects.length > 0}
            />

          </motion.section>{/* =================================================
              ANALYTICS
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-analytics">

            <RiskDistribution
              counts={riskCounts}
              total={projects.length}
            />

            <RiskTrend
              averageRisk={averageRisk}
            />

          </motion.section>{/* =================================================
              WARNING + INSIGHT
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-lower-grid">

            <EarlyWarning
              project={criticalProjects[0]}
            />

            <section className="dash2-panel dash2-insight-panel">

              <div className="dash2-panel-head">

                <div>
                  <span className="dash2-panel-kicker">
                    PORTFOLIO SIGNAL
                  </span>

                  <h3>What DARPAN sees</h3>
                </div>

                <div className="dash2-signal-badge">
                  <TrendingUp size={13} />
                  Predictive
                </div>

              </div>

              <div className="dash2-insight-list">

                <InsightRow
                  label="Average portfolio risk"
                  value={`${averageRisk}/100`}
                  note={
                    averageRisk >= 70
                      ? "Elevated"
                      : averageRisk >= 45
                      ? "Moderate"
                      : "Controlled"
                  }
                />

                <InsightRow
                  label="Financial vs physical gap"
                  value={
                    projects.length
                      ? `${Math.round(
                          projects.reduce(
                            (sum, p) =>
                              sum +
                              (p.progress.financial -
                                p.progress.physical),
                            0
                          ) / projects.length
                        )} pp`
                      : "—"
                  }
                  note="Portfolio average"
                />

                <InsightRow
                  label="Highest-risk project"
                  value={
                    priorityProjects[0]?.risk.overall ?? "—"
                  }
                  note={
                    priorityProjects[0]?.name ??
                    "No projects"
                  }
                />

              </div>

            </section>

          </motion.section>{/* =================================================
              PRIORITY PROJECTS
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-panel dash2-priority">

            <div className="dash2-panel-head">

              <div>
                <span className="dash2-panel-kicker">
                  PRIORITY QUEUE
                </span>

                <h3>
                  Projects requiring attention
                </h3>
              </div>

              <Link
                href="/projects"
                className="dash2-view-all"
              >
                View all <span>→</span>
              </Link>

            </div>

            {loading ? (
              <div className="dash2-loading">
                <div className="loading-spinner" />
                Loading portfolio intelligence...
              </div>
            ) : (
              <div className="dash2-project-list">

                {priorityProjects.map(
                  (project, index) => (
                    <PriorityProjectRow
                      key={project.id}
                      project={project}
                      rank={index + 1}
                    />
                  )
                )}

              </div>
            )}

          </motion.section>{/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <motion.section variants={itemVariants} className="dash2-actions">

            <Link
              href="/warnings"
              className="dash2-action-card overflow-hidden relative"
            >
              <SpotlightCard className="h-full w-full flex flex-col justify-center p-6 border-0 w-full" spotlightColor="rgba(255, 255, 255, 0.05)">
              <div className="dash2-action-icon warning">
                <AlertTriangle size={17} />
              </div>

              <div>
                <span>EARLY WARNINGS</span>
                <strong>
                  Review predictive signals
                </strong>
              </div>

              <b>→</b>
              </SpotlightCard>
            </Link>

            <Link
              href="/projects"
              className="dash2-action-card overflow-hidden relative"
            >
              <SpotlightCard className="h-full w-full flex flex-col justify-center p-6 border-0 w-full" spotlightColor="rgba(255, 255, 255, 0.05)">
              <div className="dash2-action-icon">
                <Building2 size={17} />
              </div>

              <div>
                <span>PROJECT INTELLIGENCE</span>
                <strong>
                  Explore monitored projects
                </strong>
              </div>

              <b>→</b>
              </SpotlightCard>
            </Link>

            <Link
              href="/investigation"
              className="dash2-action-card overflow-hidden relative"
            >
              <SpotlightCard className="h-full w-full flex flex-col justify-center p-6 border-0 w-full" spotlightColor="rgba(255, 255, 255, 0.05)">
              <div className="dash2-action-icon">
                <ShieldAlert size={17} />
              </div>

              <div>
                <span>INVESTIGATION</span>
                <strong>
                  Inspect unusual behaviour
                </strong>
              </div>

              <b>→</b>
              </SpotlightCard>
            </Link>

          </motion.section></motion.div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function DashboardSidebar({
  criticalCount,
}: {
  criticalCount: number;
}) {
  return (
    <>
      <div className="brand">

        <div className="brand-logo-wrap">
          <Image
            src="/darpan-emblem.png"
            alt="DARPAN"
            width={48}
            height={48}
            priority
            className="darpan-logo"
          />
        </div>

        <div>
          <div className="brand-name">
            DARPAN
          </div>

          <div className="brand-subtitle">
            Rural Projects &amp; National Oversight
          </div>
        </div>

      </div>

      <div className="sidebar-section-label">
        COMMAND CENTER
      </div>

      <nav className="sidebar-nav">

        <Link
          href="/"
          className="nav-item nav-active"
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/projects"
          className="nav-item"
        >
          <Building2 size={18} />
          <span>Projects</span>
        </Link>

        <Link
          href="/warnings"
          className="nav-item"
        >
          <AlertTriangle size={18} />

          <span>
            Early Warnings
          </span>

          {criticalCount > 0 && (
            <span className="nav-count">
              {criticalCount}
            </span>
          )}

        </Link>

        <Link
          href="/investigation"
          className="nav-item"
        >
          <ShieldAlert size={18} />
          <span>Investigation</span>
        </Link>

      </nav>

      <div className="sidebar-spacer" />

      <div className="system-status">

        <div className="status-pulse">
          <span />
        </div>

        <div>
          <div className="status-title">
            Analytics engine
          </div>

          <div className="status-value">
            Operational
          </div>
        </div>

      </div>

      <div className="sidebar-footer">

        <div className="footer-symbol">
          D
        </div>

        <div>
          <div className="footer-name">
            DARPAN v0.1
          </div>

          <div className="footer-text">
            Predictive monitoring
          </div>
        </div>

      </div>
    </>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  icon,
  label,
  value,
  helper,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  helper: string;
  danger?: boolean;
}) {
  return (
    <SpotlightCard
      spotlightColor={danger ? "rgba(186, 26, 26, 0.15)" : "rgba(138, 77, 75, 0.12)"}
      className={`dash2-kpi ${danger ? "danger" : ""}`}
    >

      <div className="dash2-kpi-top">

        <div className="dash2-kpi-icon">
          {icon}
        </div>

        {danger && (
          <span className="dash2-kpi-alert">
            <AlertTriangle size={12} />
          </span>
        )}

      </div>

      <div className="dash2-kpi-value">
        {value}
      </div>

      <div className="dash2-kpi-label">
        {label}
      </div>

      <div className="dash2-kpi-helper">
        {helper}
      </div>

    </SpotlightCard>
  );
}

/* =========================================================
   RISK DISTRIBUTION
========================================================= */

function RiskDistribution({
  counts,
  total,
}: {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  total: number;
}) {
  const criticalPct =
    total ? (counts.critical / total) * 100 : 0;

  const highPct =
    total ? (counts.high / total) * 100 : 0;

  const mediumPct =
    total ? (counts.medium / total) * 100 : 0;

  const lowPct =
    total ? (counts.low / total) * 100 : 0;

  const criticalEnd = criticalPct;
  const highEnd =
    criticalEnd + highPct;

  const mediumEnd =
    highEnd + mediumPct;

  return (
    <section className="dash2-panel dash2-risk-panel">

      <div className="dash2-panel-head">

        <div>
          <span className="dash2-panel-kicker">
            PORTFOLIO HEALTH
          </span>

          <h3>
            Risk distribution
          </h3>
        </div>

        <span className="dash2-mini-badge">
          <span />
          Live
        </span>

      </div>

      <div className="dash2-risk-body">

        <div
          className="dash2-donut"
          style={{
            background: `conic-gradient(
              #ba1a1a 0 ${criticalEnd}%,
              #8a4d4b ${criticalEnd}% ${highEnd}%,
              #b47738 ${highEnd}% ${mediumEnd}%,
              #565e74 ${mediumEnd}% 100%
            )`,
          }}
        >

          <div className="dash2-donut-center">

            <strong>
              {total
                ? Math.round(
                    ((counts.critical +
                      counts.high) /
                      total) *
                      100
                  )
                : 0}
              %
            </strong>

            <span>
              high risk
            </span>

          </div>

        </div>

        <div className="dash2-legend">

          <LegendRow
            label="Low risk"
            value={counts.low}
            percentage={lowPct}
            type="low"
          />

          <LegendRow
            label="Medium"
            value={counts.medium}
            percentage={mediumPct}
            type="medium"
          />

          <LegendRow
            label="High"
            value={counts.high}
            percentage={highPct}
            type="high"
          />

          <LegendRow
            label="Critical"
            value={counts.critical}
            percentage={criticalPct}
            type="critical"
          />

        </div>

      </div>

      <div className="dash2-risk-bar">

        <span
          style={{ width: `${lowPct}%` }}
          className="low"
        />

        <span
          style={{ width: `${mediumPct}%` }}
          className="medium"
        />

        <span
          style={{ width: `${highPct}%` }}
          className="high"
        />

        <span
          style={{ width: `${criticalPct}%` }}
          className="critical"
        />

      </div>

    </section>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function LegendRow({
  label,
  value,
  percentage,
  type,
}: {
  label: string;
  value: number;
  percentage: number;
  type:
    | "low"
    | "medium"
    | "high"
    | "critical";
}) {
  return (
    <div className="dash2-legend-row">

      <span
        className={`dash2-legend-dot ${type}`}
      />

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {Math.round(percentage)}%
      </small>

    </div>
  );
}

/* =========================================================
   RISK TREND
========================================================= */

function RiskTrend({
  averageRisk,
}: {
  averageRisk: number;
}) {
  const data = [
    { name: "Nov", risk: 76 },
    { name: "Dec", risk: 73 },
    { name: "Jan", risk: 70 },
    { name: "Feb", risk: 71 },
    { name: "Mar", risk: 63 },
    { name: "Apr", risk: 65 },
    { name: "May", risk: 58 },
    { name: "Jun", risk: 61 },
    { name: "Jul", risk: 53 },
    { name: "Aug", risk: 56 },
    { name: "Sep", risk: 48 },
    { name: "Oct", risk: 51 },
    { name: "Nov", risk: 43 },
    { name: "Dec", risk: 36 },
  ];

  return (
    <section className="dash2-panel dash2-trend-panel">
      <div className="dash2-panel-head">
        <div>
          <span className="dash2-panel-kicker">RISK TRAJECTORY</span>
          <h3>Portfolio risk trend</h3>
        </div>
        <div className="dash2-trend-value">
          <TrendingUp size={13} />
          <strong>+4.8%</strong>
          <span>vs previous</span>
        </div>
      </div>

      <div className="dash2-chart" style={{ height: '220px', marginLeft: '0px', marginRight: '5px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8a4d4b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#565e74" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: "#857372", fontWeight: 600 }} 
              axisLine={false} 
              tickLine={false} 
              minTickGap={10} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#31312c", borderRadius: "8px", border: "none", color: "#ffffff", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", fontSize: "12px", fontWeight: 600 }}
              itemStyle={{ color: "#ffffff", fontWeight: 800 }}
              cursor={{ stroke: "rgba(138, 77, 75, 0.4)", strokeWidth: 2, strokeDasharray: "5 5" }}
            />
            <Area 
              type="monotone" 
              dataKey="risk" 
              stroke="#8a4d4b" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorRisk)" 
              activeDot={{ r: 6, fill: "#ffffff", stroke: "#8a4d4b", strokeWidth: 2 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="dash2-chart-footer" style={{ marginTop: '5px' }}>
        <span>Current portfolio risk</span>
        <strong>{averageRisk}/100</strong>
      </div>
    </section>
  );
}

/* =========================================================
   EARLY WARNING
========================================================= */

function EarlyWarning({
  project,
}: {
  project?: Project;
}) {
  return (
    <section className="dash2-panel dash2-warning-panel">

      <div className="dash2-panel-head">

        <div>
          <span className="dash2-panel-kicker">
            EARLY WARNING
          </span>

          <h3>
            Attention required
          </h3>
        </div>

        <div className="dash2-warning-head-icon">
          <AlertTriangle size={17} />
        </div>

      </div>

      {project ? (
        <div className="dash2-warning-card">
          <div className="dash2-warning-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="dash2-warning-main">

            <div className="dash2-warning-project">
              {project.name}
            </div>

            <div className="dash2-warning-title">
              {project.primaryRiskDriver ??
                "Risk signal detected"}
            </div>

            <div className="dash2-warning-meta">

              <span>
                Risk score
              </span>

              <strong>
                {project.risk.overall}/100
              </strong>

              <span>
                •
              </span>

              <span>
                {project.state}
              </span>

            </div>

            <Link
              href={`/projects/${project.id}`}
            >
              Investigate <span>→</span>
            </Link>

          </div>

        </div>
      ) : (
        <div className="dash2-no-warning">

          <TrendingDown size={22} />

          <strong>
            No critical projects
          </strong>

          <span>
            Portfolio is currently within
            monitored thresholds.
          </span>

        </div>
      )}

    </section>
  );
}

/* =========================================================
   INSIGHT
========================================================= */

function InsightRow({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="dash2-insight-row">

      <div>

        <span>
          {label}
        </span>

        <small>
          {note}
        </small>

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}

/* =========================================================
   PRIORITY PROJECT
========================================================= */

function PriorityProjectRow({
  project,
  rank,
}: {
  project: Project;
  rank: number;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="dash2-project-row"
    >
      <span className="dash2-rank">
        {String(rank).padStart(2, "0")}
      </span>

      <div className="dash2-project-icon">
        <Building2 size={17} />
      </div>

      <div className="dash2-project-main">

        <strong>
          {project.name}
        </strong>

        <span>
          {project.ministry}
        </span>

      </div>

      <div className="dash2-project-location relative z-10">

        <span>
          Location
        </span>

        <strong>
          {project.state}
        </strong>

      </div>

      <div className="dash2-project-progress relative z-10">

        <span>
          Physical
        </span>

        <strong>
          {project.progress.physical}%
        </strong>

        <div>
          <span
            style={{
              width: `${project.progress.physical}%`,
            }}
          />
        </div>

      </div>

      <div
        className={`dash2-risk-score relative z-10 ${project.risk.level}`}
      >

        <strong>
          {project.risk.overall}
        </strong>

        <span>
          {project.risk.level}
        </span>

      </div>

      <span className="dash2-project-arrow relative z-10">
        →
      </span>

    </Link>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatCrore(value: number) {
  return `₹${value.toLocaleString("en-IN")} Cr`;
}