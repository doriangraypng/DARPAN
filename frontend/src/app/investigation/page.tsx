"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getProjects } from "@/lib/api";
import AnimatedCounter from "@/components/ui/animated-counter";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";
import { Project, RiskLevel } from "@/types/project";

type SignalKind =
  | "anomaly"
  | "cost"
  | "schedule"
  | "divergence"
  | "implementation";

interface Signal {
  id: string;
  projectId: string;
  projectName: string;
  ministry: string;
  state: string;
  kind: SignalKind;
  title: string;
  detail: string;
  severity: RiskLevel;
  weight: number; // for ranking within a severity
}

const severityRank: Record<RiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

type SeverityFilter = "all" | RiskLevel;

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: {} as any } };

export default function InvestigationPage() {
  const [projects, setProjects] = useState<Project[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] =
    useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getProjects();
        if (mounted) {
          setProjects(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load projects:",
          err
        );
        if (mounted) {
          setError("Unable to load investigation data.");
          setProjects([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     BUILD SIGNAL FEED
  ===================================================== */

  const signals = useMemo(
    () => buildSignals(projects),
    [projects]
  );

  const filteredSignals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return signals
      .filter((signal) => {
        const matchesSeverity =
          filter === "all" ||
          signal.severity === filter;

        const matchesSearch =
          !query ||
          [
            signal.projectName,
            signal.projectId,
            signal.ministry,
            signal.state,
            signal.title,
            signal.detail,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return matchesSeverity && matchesSearch;
      })
      .sort((a, b) => {
        const diff =
          severityRank[b.severity] -
          severityRank[a.severity];
        if (diff !== 0) return diff;
        return b.weight - a.weight;
      });
  }, [signals, filter, search]);

  const summary = useMemo(() => {
    const anomalyCount = projects.reduce(
      (sum, p) => sum + (p.anomalies?.length ?? 0),
      0
    );

    return {
      projects: projects.length,
      signals: signals.length,
      critical: signals.filter(
        (s) => s.severity === "critical"
      ).length,
      anomalies: anomalyCount,
    };
  }, [projects, signals]);

  return (
    <main className="darpan-app">
      <aside className="sidebar">
        <InvestigationSidebar />
      </aside>

      <section className="main-area">
        <header className="top-header">
          <div>
            <div className="breadcrumb">
              COMMAND CENTER / INVESTIGATION
            </div>
            <h1>Investigation</h1>
          </div>

          <div className="data-refresh">
            <div className="refresh-dot" />
            <span>Data snapshot</span>
            <strong>July 2026</strong>
          </div>
        </header>

        <div className="dashboard-content inv">
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "contents" }}>

          {/* INTRO */}
          <motion.section variants={itemVariants} className="inv-intro">
            <div>
              <div className="inv-eyebrow">
                <span />
                EVIDENCE &amp; ANOMALY REVIEW
              </div>
              <h2>
                Inspect unusual project behaviour.
              </h2>
              <p>
                Consolidated anomaly signals and
                model-derived evidence across the
                monitored portfolio, ranked by
                severity for prioritised review.
              </p>
            </div>

            <div className="inv-summary">
              <SummaryTile
                label="Projects reviewed"
                value={summary.projects}
                icon={<Building2 size={17} />}
              />
              <SummaryTile
                label="Active signals"
                value={summary.signals}
                icon={<ShieldAlert size={17} />}
              />
              <SummaryTile
                label="Critical"
                value={summary.critical}
                icon={<AlertTriangle size={17} />}
                danger
              />
              <SummaryTile
                label="Logged anomalies"
                value={summary.anomalies}
                icon={<Search size={17} />}
              />
            </div></motion.section>{error && (
            <div className="inv-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* CONTROLS */}
          <motion.section variants={itemVariants} className="inv-controls">
            <div className="inv-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search project, ministry, state or signal..."
                aria-label="Search signals"
              />
            </div>

            <div className="inv-filters">
              {(
                [
                  "all",
                  "critical",
                  "high",
                  "medium",
                  "low",
                ] as SeverityFilter[]
              ).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`inv-filter ${
                    filter === value ? "active" : ""
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {value === "all"
                    ? "All"
                    : titleCase(value)}
                </button>
              ))}
            </div></motion.section>

          {/* FEED */}
          <motion.section variants={itemVariants} className="inv-feed">
            {loading ? (
              <div className="inv-state">
                <div className="loading-spinner" />
                <span>
                  Compiling investigation signals...
                </span>
              </div>
            ) : filteredSignals.length > 0 ? (
              filteredSignals.slice(0, 100).map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                />
              ))
            ) : (
              <div className="inv-state">
                <CheckCircle2 size={26} />
                <strong>No signals to review</strong>
                <span>
                  {signals.length === 0
                    ? "No anomaly or evidence signals were detected across the portfolio."
                    : "No signals match the current filters."}
                </span>
              </div>
)}</motion.section></motion.div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SIGNAL BUILDER
========================================================= */

function buildSignals(projects: Project[]): Signal[] {
  const signals: Signal[] = [];

  for (const project of projects) {
    const base = {
      projectId: project.id,
      projectName: project.name,
      ministry: project.ministry,
      state: project.state,
    };

    // 1. Explicit anomalies (highest evidentiary value).
    for (const anomaly of project.anomalies ?? []) {
      signals.push({
        ...base,
        id: `${project.id}-${anomaly.id}`,
        kind: "anomaly",
        title: anomaly.type,
        detail: anomaly.description,
        severity: anomaly.severity,
        weight: 100,
      });
    }

    // 2. Cost escalation evidence.
    const costVariance =
      project.financial.revisedCost -
      project.financial.approvedCost;

    if (
      costVariance > 0 &&
      project.prediction.costOverrunProbability >= 50
    ) {
      const pct =
        project.financial.approvedCost > 0
          ? Math.round(
              (costVariance /
                project.financial.approvedCost) *
                100
            )
          : 0;

      signals.push({
        ...base,
        id: `${project.id}-cost`,
        kind: "cost",
        title: "Cost escalation",
        detail: `Revised cost exceeds approved by ₹${Math.round(
          costVariance
        ).toLocaleString(
          "en-IN"
        )} Cr (+${pct}%), with a ${
          project.prediction.costOverrunProbability
        }% modelled overrun probability.`,
        severity: toSeverity(
          project.prediction.costOverrunProbability
        ),
        weight:
          project.prediction.costOverrunProbability,
      });
    }

    // 3. Schedule pressure evidence.
    if (project.prediction.timeOverrunProbability >= 60) {
      signals.push({
        ...base,
        id: `${project.id}-schedule`,
        kind: "schedule",
        title: "Schedule pressure",
        detail: `Schedule risk is elevated (${project.risk.schedule}/100) with a ${project.prediction.timeOverrunProbability}% modelled probability of time overrun.`,
        severity: toSeverity(
          project.prediction.timeOverrunProbability
        ),
        weight:
          project.prediction.timeOverrunProbability,
      });
    }

    // 4. Financial vs physical divergence evidence.
    const gap =
      project.progress.financial -
      project.progress.physical;

    if (Math.abs(gap) >= 8) {
      signals.push({
        ...base,
        id: `${project.id}-divergence`,
        kind: "divergence",
        title: "Progress divergence",
        detail: `Financial progress (${
          project.progress.financial
        }%) diverges from physical progress (${
          project.progress.physical
        }%) by ${Math.abs(gap)} percentage points.`,
        severity:
          Math.abs(gap) >= 15 ? "high" : "medium",
        weight: Math.abs(gap),
      });
    }

    // 5. Implementation risk evidence.
    if (
      project.prediction
        .implementationRiskProbability >= 60
    ) {
      signals.push({
        ...base,
        id: `${project.id}-implementation`,
        kind: "implementation",
        title: "Implementation risk",
        detail: `Implementation risk is elevated with a ${project.prediction.implementationRiskProbability}% modelled probability of execution pressure.`,
        severity: toSeverity(
          project.prediction
            .implementationRiskProbability
        ),
        weight:
          project.prediction
            .implementationRiskProbability,
      });
    }
  }

  return signals;
}

function toSeverity(value: number): RiskLevel {
  if (value >= 80) return "critical";
  if (value >= 60) return "high";
  if (value >= 35) return "medium";
  return "low";
}

/* =========================================================
   SIGNAL CARD
========================================================= */

const MotionArticle = motion.create("article");

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <MotionArticle variants={itemVariants} className={`inv-signal pd-risk--${signal.severity}`}>
      <div className="inv-signal-icon">
        {signalIcon(signal.kind)}
      </div>

      <div className="inv-signal-body">
        <div className="inv-signal-top">
          <strong>{signal.title}</strong>
          <span className="inv-signal-pill">
            {titleCase(signal.severity)}
          </span>
        </div>

        <p>{signal.detail}</p>

        <div className="inv-signal-meta">
          <span>{signal.projectName}</span>
          <span>•</span>
          <span>{signal.state}</span>
          <span>•</span>
          <span>{signal.ministry}</span>
        </div>
      </div>

      <Link
        href={`/projects/${signal.projectId}`}
        className="inv-signal-link"
      >
        Open project →
      </Link>
    </MotionArticle>
  );
}

function signalIcon(kind: SignalKind) {
  switch (kind) {
    case "cost":
      return <IndianRupee size={18} />;
    case "schedule":
      return <Clock3 size={18} />;
    case "divergence":
      return <TrendingUp size={18} />;
    case "implementation":
      return <ShieldAlert size={18} />;
    default:
      return <Search size={18} />;
  }
}

/* =========================================================
   SUMMARY TILE
========================================================= */

function SummaryTile({
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
      className={`inv-tile ${danger ? "danger" : ""}`}
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

function InvestigationSidebar() {
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
          <div className="brand-name">DARPAN</div>
          <div className="brand-subtitle">
            Rural Projects &amp; National Oversight
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">
        COMMAND CENTER
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className="nav-item">
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </Link>

        <Link href="/projects" className="nav-item">
          <Building2 size={18} />
          <span>Projects</span>
        </Link>

        <Link href="/warnings" className="nav-item">
          <AlertTriangle size={18} />
          <span>Early Warnings</span>
        </Link>

        <Link
          href="/investigation"
          className="nav-item nav-active"
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
        <div className="footer-symbol">D</div>
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
   HELPERS
========================================================= */

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
