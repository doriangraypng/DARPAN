"use client";

import { AlertTriangle, ArrowUpDown, Building2, ChevronRight, Search, ShieldCheck, SlidersHorizontal, TrendingDown, TrendingUp, X, ArrowLeft, CheckCircle2, Clock3, IndianRupee, MapPin, ShieldAlert, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import AnimatedCounter from "@/components/ui/animated-counter";
import { getProject, getProjects } from "@/lib/api";
import { Project, RiskLevel } from "@/types/project";


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

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();

  const projectId = decodeURIComponent(
    params?.id ?? ""
  );

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // Primary: dedicated lookup.
        let data = await getProject(projectId);

        // Fallback: portfolio scan (keeps the page
        // resilient to the mock API shape).
        if (!data) {
          const all = await getProjects();
          data = all.find(
            (item) => item.id === projectId
          );
        }

        if (!mounted) return;

        if (!data) {
          setProject(null);
          setError("Project not found.");
          return;
        }

        setProject(data);
      } catch (err) {
        console.error(
          "Failed to load project:",
          err
        );

        if (mounted) {
          setProject(null);
          setError(
            "Unable to load project intelligence."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (projectId) {
      load();
    } else {
      setLoading(false);
      setError("Project not found.");
    }

    return () => {
      mounted = false;
    };
  }, [projectId]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="darpan-app">
        <aside className="sidebar">
          <ProjectSidebar />
        </aside>

        <section className="main-area">
          <DetailHeader />

          <div className="dashboard-content">
            <div className="pd-state">
              <div className="loading-spinner" />
              <strong>
                Loading project intelligence...
              </strong>
              <span>
                Preparing financial, progress and
                risk indicators.
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     NOT FOUND / ERROR
  ===================================================== */

  if (!project) {
    return (
      <main className="darpan-app">
        <aside className="sidebar">
          <ProjectSidebar />
        </aside>

        <section className="main-area">
          <DetailHeader />

          <div className="dashboard-content">
            <div className="pd-state pd-state--error">
              <AlertTriangle size={30} />
              <strong>Project unavailable</strong>
              <span>
                {error ||
                  "The requested project could not be found."}
              </span>

              <Link
                href="/projects"
                className="pd-back-btn"
              >
                <ArrowLeft size={15} />
                Back to projects
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =====================================================
     DERIVED VALUES
  ===================================================== */

  const approvedCost = safeNumber(
    project.financial.approvedCost
  );
  const revisedCost = safeNumber(
    project.financial.revisedCost
  );
  const expenditure = safeNumber(
    project.financial.expenditure
  );

  const costVariance = revisedCost - approvedCost;
  const costVariancePct =
    approvedCost > 0
      ? Math.round(
          (costVariance / approvedCost) * 100
        )
      : 0;

  const expenditurePct =
    revisedCost > 0
      ? clamp((expenditure / revisedCost) * 100)
      : 0;

  const physical = clamp(project.progress.physical);
  const financial = clamp(project.progress.financial);
  const progressGap = financial - physical;

  const overall = clamp(project.risk.overall);
  const level = project.risk.level;

  const warnings = project.warnings ?? [];
  const anomalies = project.anomalies ?? [];
  const benchmark = project.benchmark;

  return (
    <main className="darpan-app">
      <aside className="sidebar">
        <ProjectSidebar />
      </aside>

      <section className="main-area">
        <DetailHeader />

        <div className="dashboard-content pd">
<motion.div variants={containerVariants} initial="hidden" animate="show" className="dash2-motion-container">

          {/* BACK */}
          <Link href="/projects" className="pd-back">
            <ArrowLeft size={15} />
            Back to projects
          </Link>

          {/* HERO */}
          <motion.section variants={itemVariants} className="pd-hero">
            <div className="pd-hero-heading">
              <div className="pd-hero-icon">
                <Building2 size={25} />
              </div>

              <div className="pd-hero-copy">
                <div className="pd-id">
                  {project.id}
                </div>

                <h2>{project.name}</h2>

                <div className="pd-meta">
                  <span>
                    <MapPin size={12} />
                    {project.state}
                    {project.district
                      ? ` · ${project.district}`
                      : ""}
                  </span>
                  <span>
                    <Building2 size={12} />
                    {project.sector}
                  </span>
                  <span>{project.ministry}</span>
                </div>
              </div>
            </div>

            <div
              className={`pd-risk-badge pd-risk--${level}`}
            >
              <div className="pd-risk-badge-label">
                DARPAN RISK SCORE
              </div>
              <div className="pd-risk-badge-score">
                {overall}
                <span>/100</span>
              </div>
              <div className="pd-risk-badge-status">
                <span className="pd-risk-dot" />
                {titleCase(level)} risk
              </div>
            </div>
          </motion.section>
{/* STATUS STRIP */}
          <motion.section variants={itemVariants} className="pd-status-strip">
            <StatusItem
              label="Status"
              value={titleCase(project.status)}
            />
            <StatusItem
              label="Start date"
              value={formatDate(project.startDate)}
            />
            <StatusItem
              label="Expected completion"
              value={formatDate(
                project.expectedCompletion
              )}
            />
            <StatusItem
              label="Last updated"
              value={formatDate(project.lastUpdated)}
            />
          </motion.section>

          {/* RISK + EXECUTION */}
          <div className="pd-grid-2">

            {/* RISK FINGERPRINT */}
            <motion.section variants={itemVariants} className="pd-panel">
              <span className="pd-panel-label">
                RISK FINGERPRINT
              </span>
              <h3 className="pd-panel-title">
                Current risk composition
              </h3>

              <div className="pd-metrics">
                <RiskMetric
                  label="Schedule risk"
                  value={project.risk.schedule}
                  icon={<Clock3 size={16} />}
                />
                <RiskMetric
                  label="Cost risk"
                  value={project.risk.cost}
                  icon={<IndianRupee size={16} />}
                />
                <RiskMetric
                  label="Implementation"
                  value={project.risk.implementation}
                  icon={<ShieldAlert size={16} />}
                />
              </div>

              <div className="pd-driver">
                <span>PRIMARY RISK DRIVER</span>
                <strong>
                  {project.primaryRiskDriver ??
                    "No dominant risk driver identified"}
                </strong>
              </div>
            </motion.section>

            {/* EXECUTION HEALTH */}
            <motion.section variants={itemVariants} className="pd-panel">
              <span className="pd-panel-label">
                EXECUTION HEALTH
              </span>
              <h3 className="pd-panel-title">
                Physical vs financial progress
              </h3>

              <ProgressRow
                label="Physical progress"
                value={physical}
              />
              <ProgressRow
                label="Financial progress"
                value={financial}
              />

              <div
                className={`pd-insight ${
                  progressGap > 0
                    ? "pd-insight--pos"
                    : progressGap < 0
                    ? "pd-insight--neg"
                    : ""
                }`}
              >
                {progressGap > 0 ? (
                  <TrendingUp size={14} />
                ) : progressGap < 0 ? (
                  <TrendingDown size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>
                  {progressGap === 0
                    ? "Physical and financial progress are aligned."
                    : `Financial progress is ${Math.abs(
                        progressGap
                      )} percentage points ${
                        progressGap > 0
                          ? "ahead of"
                          : "behind"
                      } physical progress.`}
                </span>
              </div>
            </motion.section>
          </div>

          {/* FINANCIAL POSITION */}
          <motion.section variants={itemVariants} className="pd-panel">
            <div className="pd-panel-head">
              <div>
                <span className="pd-panel-label">
                  FINANCIAL POSITION
                </span>
                <h3 className="pd-panel-title">
                  Project cost position
                </h3>
              </div>
              <span
                className={`pd-tag ${
                  costVariance > 0
                    ? "pd-tag--danger"
                    : "pd-tag--safe"
                }`}
              >
                {costVariance > 0
                  ? "Cost exposure"
                  : "Within approved cost"}
              </span>
            </div>

            <div className="pd-financial-grid">
              <FinancialMetric
                label="Approved cost"
                value={formatCrore(approvedCost)}
              />
              <FinancialMetric
                label="Revised cost"
                value={formatCrore(revisedCost)}
                danger={costVariance > 0}
              />
              <FinancialMetric
                label="Expenditure"
                value={formatCrore(expenditure)}
              />
              <FinancialMetric
                label="Cost variance"
                value={`${
                  costVariance > 0 ? "+" : ""
                }${formatCrore(costVariance)}${
                  costVariance !== 0
                    ? ` (${
                        costVariancePct > 0 ? "+" : ""
                      }${costVariancePct}%)`
                    : ""
                }`}
                danger={costVariance > 0}
              />
            </div>

            <div className="pd-financial-progress">
              <div>
                <span>
                  Expenditure against revised cost
                </span>
                <strong>{expenditurePct}%</strong>
              </div>
              <div className="pd-track">
                <span
                  style={{
                    width: `${expenditurePct}%`,
                  }}
                />
              </div>
            </div>
          </motion.section>

          {/* PREDICTIVE INTELLIGENCE */}
          <motion.section variants={itemVariants} className="pd-panel">
            <div className="pd-panel-head">
              <div>
                <span className="pd-panel-label">
                  PREDICTIVE INTELLIGENCE
                </span>
                <h3 className="pd-panel-title">
                  Forward-looking risk signals
                </h3>
              </div>
              <span className="pd-badge">
                <TrendingUp size={13} />
                Predictive
              </span>
            </div>

            <div className="pd-prediction-grid">
              <Prediction
                title="Cost overrun probability"
                value={project.prediction.costOverrunProbability}
                description="Estimated probability of cost escalation"
              />
              <Prediction
                title="Time overrun probability"
                value={project.prediction.timeOverrunProbability}
                description="Estimated probability of schedule deviation"
              />
              <Prediction
                title="Implementation risk"
                value={
                  project.prediction
                    .implementationRiskProbability
                }
                description="Estimated execution pressure"
              />
            </div>
          </motion.section>

          {/* BENCHMARK + ANOMALY */}
          <div className="pd-grid-2">

            {/* BENCHMARK */}
            <motion.section variants={itemVariants} className="pd-panel">
              <span className="pd-panel-label">
                PEER BENCHMARKING
              </span>
              <h3 className="pd-panel-title">
                How this project compares
              </h3>

              {benchmark ? (
                <>
                  <div className="pd-benchmark-main">
                    <div className="pd-benchmark-score">
                      <strong>
                        {benchmark.percentile}
                      </strong>
                      <span>percentile</span>
                    </div>
                    <p>
                      Compared with{" "}
                      <strong>
                        {benchmark.peerCount}
                      </strong>{" "}
                      similar projects.
                    </p>
                  </div>

                  <div className="pd-benchmark-metrics">
                    <BenchmarkMetric
                      label="Cost performance"
                      value={benchmark.costPerformance}
                    />
                    <BenchmarkMetric
                      label="Schedule performance"
                      value={
                        benchmark.schedulePerformance
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="pd-empty">
                  <BarChart3 size={20} />
                  <span>
                    Peer benchmark data is not
                    available for this project.
                  </span>
                </div>
              )}
            </motion.section>

            {/* ANOMALY SIGNALS */}
            <motion.section variants={itemVariants} className="pd-panel">
              <span className="pd-panel-label">
                ANOMALY SIGNALS
              </span>
              <h3 className="pd-panel-title">
                Behaviour requiring review
              </h3>

              {anomalies.length > 0 ? (
                <div className="pd-anomaly-list">
                  {anomalies.map((anomaly) => (
                    <div
                      className="pd-anomaly"
                      key={anomaly.id}
                    >
                      <span
                        className={`pd-anomaly-dot pd-risk--${anomaly.severity}`}
                      />
                      <div>
                        <strong>{anomaly.type}</strong>
                        <span>
                          {anomaly.description}
                        </span>
                        <small>
                          {formatDate(
                            anomaly.detectedAt
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pd-empty">
                  <CheckCircle2 size={20} />
                  <span>
                    No anomaly signals are currently
                    recorded for this project.
                  </span>
                </div>
              )}
            </motion.section>
</div>

          {/* WARNING REGISTER */}
          {warnings.length > 0 && (
            <motion.section variants={itemVariants} className="pd-panel">
              <span className="pd-panel-label">
                WARNING REGISTER
              </span>
              <h3 className="pd-panel-title">
                Active project signals
              </h3>

              <div className="pd-warning-list">
                {warnings.map((warning) => (
                  <div
                    className="pd-warning"
                    key={warning.id}
                  >
                    <div
                      className={`pd-warning-icon pd-risk--${warning.severity}`}
                    >
                      <AlertTriangle size={16} />
                    </div>
                    <div className="pd-warning-body">
                      <div className="pd-warning-top">
                        <strong>
                          {warning.title}
                        </strong>
                        <span
                          className={`pd-pill pd-risk--${warning.severity}`}
                        >
                          {titleCase(
                            warning.severity
                          )}
                        </span>
                      </div>
                      <p>{warning.description}</p>
                      <div className="pd-warning-meta">
                        <span>Probability</span>
                        <strong>
                          {warning.probability ?? "—"}
                          %
                        </strong>
                        <span>•</span>
                        <span>
                          {formatDate(
                            warning.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* NEXT MODULES */}
          <motion.div variants={itemVariants} className="pd-modules">
            <Link
              href="/warnings"
              className="pd-module"
            >
              <div className="pd-module-icon">
                <AlertTriangle size={18} />
              </div>
              <div>
                <strong>Early warnings</strong>
                <span>
                  Review predictive signals across
                  the portfolio.
                </span>
              </div>
              <b>→</b>
            </Link>

            <Link
              href="/investigation"
              className="pd-module"
            >
              <div className="pd-module-icon">
                <ShieldAlert size={18} />
              </div>
              <div>
                <strong>Investigation</strong>
                <span>
                  Inspect unusual project behaviour
                  and evidence.
                </span>
              </div>
              <b>→</b>
            </Link>

            <Link href="/projects" className="pd-module">
              <div className="pd-module-icon">
                <Building2 size={18} />
              </div>
              <div>
                <strong>All projects</strong>
                <span>
                  Return to the monitored portfolio.
                </span>
              </div>
              <b>→</b>
            </Link>
          </motion.div>
        </motion.div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   HEADER
========================================================= */

function DetailHeader() {
  return (
    <header className="top-header">
      <div>
        <div className="breadcrumb">
          PROJECTS / PROJECT INTELLIGENCE
        </div>
        <h1>Project Intelligence</h1>
      </div>

      <div className="data-refresh">
        <div className="refresh-dot" />
        <span>Data snapshot</span>
        <strong>July 2026</strong>
      </div>
    </header>
  );
}

/* =========================================================
   SIDEBAR (shared shell, logo, active = Projects)
========================================================= */

function ProjectSidebar() {
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

        <Link
          href="/projects"
          className="nav-item nav-active"
        >
          <Building2 size={18} />
          <span>Projects</span>
        </Link>

        <Link href="/warnings" className="nav-item">
          <AlertTriangle size={18} />
          <span>Early Warnings</span>
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
   SUBCOMPONENTS
========================================================= */

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="pd-status-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RiskMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const v = clamp(value);
  return (
    <div className="pd-metric">
      <div className="pd-metric-top">
        <span className="pd-metric-icon">{icon}</span>
        <span className="pd-metric-label">{label}</span>
        <strong className="pd-metric-value"><AnimatedCounter value={v} /></strong>
      </div>
      <div className="pd-track">
        <span
          className={`pd-fill pd-fill--${predictionLevel(
            v
          )}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const v = clamp(value);
  return (
    <div className="pd-progress-row">
      <div>
        <span>{label}</span>
        <strong>{v}%</strong>
      </div>
      <div className="pd-track">
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function FinancialMetric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="pd-financial-metric">
      <span>{label}</span>
      <strong className={danger ? "pd-danger" : ""}>
        {value}
      </strong>
    </div>
  );
}

function Prediction({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  const v = clamp(value);
  const level = predictionLevel(v);
  return (
    <div className={`pd-prediction pd-risk--${level} relative overflow-hidden`}>
      <SpotlightCard className="h-full w-full absolute inset-0 z-0 pointer-events-none" spotlightColor={level === "critical" ? "rgba(169,77,77,0.15)" : "rgba(255,255,255,0.06)"} />

      <span className="pd-prediction-title relative z-10">{title}</span>
      <strong className="pd-prediction-value relative z-10">{v}%</strong>
      <small className="relative z-10">{description}</small>
      <div className="pd-prediction-level relative z-10">
        {titleCase(level)} signal
      </div>
    </div>
  );
}

function BenchmarkMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const v = clamp(value);
  return (
    <div className="pd-benchmark-metric">
      <div>
        <span>{label}</span>
        <strong>{v}</strong>
      </div>
      <div className="pd-track">
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(value: unknown): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function clamp(value: unknown): number {
  return Math.max(
    0,
    Math.min(100, Math.round(safeNumber(value)))
  );
}

function formatCrore(value: number): string {
  return `₹${Math.round(value).toLocaleString(
    "en-IN"
  )} Cr`;
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function predictionLevel(value: number): RiskLevel {
  if (value >= 80) return "critical";
  if (value >= 60) return "high";
  if (value >= 35) return "medium";
  return "low";
}
