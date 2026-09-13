"use client";

import { AlertTriangle, ArrowUpDown, Building2, ChevronRight, Search, ShieldCheck, SlidersHorizontal, TrendingDown, TrendingUp, X, ArrowLeft, CheckCircle2, Clock3, IndianRupee, MapPin, ShieldAlert, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getProjects } from "@/lib/api";
import AnimatedCounter from "@/components/ui/animated-counter";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Project } from "@/types/project";

type RiskFilter = "all" | "critical" | "high" | "medium" | "low";


const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: {} as any }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] =
    useState<RiskFilter>("all");

  const [sectorFilter, setSectorFilter] =
    useState("all");

  const [stateFilter, setStateFilter] =
    useState("all");

  const [ministryFilter, setMinistryFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState<"risk" | "progress" | "cost">("risk");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getProjects();

        if (mounted) {
          setProjects(data);
        }
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ======================================================
     FILTER OPTIONS
  ====================================================== */

  const sectors = useMemo(
    () =>
      unique(
        projects.map(
          (project) => project.sector
        )
      ),
    [projects]
  );

  const states = useMemo(
    () =>
      unique(
        projects.map(
          (project) => project.state
        )
      ),
    [projects]
  );

  const ministries = useMemo(
    () =>
      unique(
        projects.map(
          (project) => project.ministry
        )
      ),
    [projects]
  );

  /* ======================================================
     FILTERED PROJECTS
  ====================================================== */

  const filteredProjects = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const result = projects.filter(
      (project) => {
        const matchesSearch =
          !query ||
          project.name
            .toLowerCase()
            .includes(query) ||
          project.id
            .toLowerCase()
            .includes(query) ||
          project.state
            .toLowerCase()
            .includes(query) ||
          project.sector
            .toLowerCase()
            .includes(query) ||
          project.ministry
            .toLowerCase()
            .includes(query);

        const matchesRisk =
          riskFilter === "all" ||
          project.risk.level === riskFilter;

        const matchesSector =
          sectorFilter === "all" ||
          project.sector === sectorFilter;

        const matchesState =
          stateFilter === "all" ||
          project.state === stateFilter;

        const matchesMinistry =
          ministryFilter === "all" ||
          project.ministry === ministryFilter;

        return (
          matchesSearch &&
          matchesRisk &&
          matchesSector &&
          matchesState &&
          matchesMinistry
        );
      }
    );

    return [...result].sort(
      (a, b) => {
        if (sortBy === "progress") {
          return (
            b.progress.physical -
            a.progress.physical
          );
        }

        if (sortBy === "cost") {
          return (
            b.financial.revisedCost -
            a.financial.revisedCost
          );
        }

        return (
          b.risk.overall -
          a.risk.overall
        );
      }
    );
  }, [
    projects,
    search,
    riskFilter,
    sectorFilter,
    stateFilter,
    ministryFilter,
    sortBy,
  ]);

  /* ======================================================
     SUMMARY
  ====================================================== */

  const critical = projects.filter(
    (p) => p.risk.level === "critical"
  ).length;

  const high = projects.filter(
    (p) => p.risk.level === "high"
  ).length;

  const medium = projects.filter(
    (p) => p.risk.level === "medium"
  ).length;

  const low = projects.filter(
    (p) => p.risk.level === "low"
  ).length;

  const totalExposure = projects.reduce(
    (sum, project) =>
      sum +
      Math.max(
        0,
        project.financial.revisedCost -
          project.financial.approvedCost
      ),
    0
  );

  const averageRisk = projects.length
    ? Math.round(
        projects.reduce(
          (sum, project) =>
            sum + project.risk.overall,
          0
        ) / projects.length
      )
    : 0;

  const hasFilters =
    search ||
    riskFilter !== "all" ||
    sectorFilter !== "all" ||
    stateFilter !== "all" ||
    ministryFilter !== "all";

  function clearFilters() {
    setSearch("");
    setRiskFilter("all");
    setSectorFilter("all");
    setStateFilter("all");
    setMinistryFilter("all");
  }

  return (
    <main className="projects-page">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="projects-sidebar">

        <div className="projects-brand">

          <div className="projects-brand-logo">
            <img
              src="/darpan-emblem.png"
              alt="DARPAN"
            />
          </div>

          <div>
            <strong>DARPAN</strong>
            <span>
              Rural Projects &amp; National Oversight
            </span>
          </div>

        </div>

        <div className="projects-nav-label">
          COMMAND CENTER
        </div>

        <nav className="projects-nav">

          <Link
            href="/"
            className="projects-nav-item"
          >
            <span>▦</span>
            Dashboard
          </Link>

          <Link
            href="/projects"
            className="projects-nav-item active"
          >
            <Building2 size={17} />
            Projects
          </Link>

          <Link
            href="/warnings"
            className="projects-nav-item"
          >
            <AlertTriangle size={17} />
            Early Warnings

            {critical > 0 && (
              <b>{critical}</b>
            )}
          </Link>

          <Link
            href="/investigation"
            className="projects-nav-item"
          >
            <ShieldCheck size={17} />
            Investigation
          </Link>

        </nav>

        <div className="projects-sidebar-bottom">

          <div className="projects-engine">

            <span />

            <div>
              <strong>
                Analytics engine
              </strong>

              <small>
                Operational
              </small>
            </div>

          </div>

          <div className="projects-version">
            DARPAN v0.1
          </div>

        </div>

      </aside>

      {/* ==================================================
          MAIN
      ================================================== */}

      <section className="projects-main">

        {/* HEADER */}

        <header className="projects-header">

          <div>

            <span className="projects-kicker">
              DARPAN / PROJECT PORTFOLIO
            </span>

            <h1>
              Infrastructure Projects
            </h1>

            <p>
              Monitor, compare and investigate
              project-level risk across the
              national portfolio.
            </p>

          </div>

          <div className="projects-snapshot">

            <span />

            <div>
              <small>
                DATA SNAPSHOT
              </small>

              <strong>
                July 2026
              </strong>
            </div>

          </div>

        </header>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="projects-summary">

          <SummaryCard
            label="Total projects"
            value={
              loading
                ? "—"
                : projects.length
            }
            note="Monitored portfolio"
            icon={
              <Building2 size={19} />
            }
          />

          <SummaryCard
            label="Critical + high"
            value={
              loading
                ? "—"
                : critical + high
            }
            note={
              projects.length
                ? `${Math.round(
                    ((critical + high) /
                      projects.length) *
                      100
                  )}% of portfolio`
                : "Risk exposure"
            }
            icon={
              <AlertTriangle size={19} />
            }
            danger={
              critical + high > 0
            }
          />

          <SummaryCard
            label="Average risk"
            value={
              loading
                ? "—"
                : `${averageRisk}/100`
            }
            note={
              averageRisk >= 70
                ? "Elevated"
                : averageRisk >= 45
                ? "Moderate"
                : "Controlled"
            }
            icon={
              <TrendingUp size={19} />
            }
          />

          <SummaryCard
            label="Cost exposure"
            value={
              loading
                ? "—"
                : formatCrore(
                    totalExposure
                  )
            }
            note="Revised − approved"
            icon={
              <TrendingDown size={19} />
            }
          />

        </section>

        {/* ==================================================
            RISK DISTRIBUTION
        ================================================== */}

        <section className="projects-risk-strip">

          <div className="projects-risk-title">

            <span>
              PORTFOLIO RISK
            </span>

            <strong>
              Risk distribution
            </strong>

          </div>

          <RiskSegment
            label="Low"
            count={low}
            total={projects.length}
            type="low"
          />

          <RiskSegment
            label="Medium"
            count={medium}
            total={projects.length}
            type="medium"
          />

          <RiskSegment
            label="High"
            count={high}
            total={projects.length}
            type="high"
          />

          <RiskSegment
            label="Critical"
            count={critical}
            total={projects.length}
            type="critical"
          />

        </section>

        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}

        <section className="projects-controls">

          <div className="projects-search">

            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search project, ID, state, sector or ministry..."
            />

            {search && (
              <button
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

          </div>

          <div className="projects-filter-group">

            <SlidersHorizontal
              size={16}
            />

            <select
              value={sectorFilter}
              onChange={(event) =>
                setSectorFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All sectors
              </option>

              {sectors.map((sector) => (
                <option
                  key={sector}
                  value={sector}
                >
                  {sector}
                </option>
              ))}

            </select>

            <select
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All states
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}

            </select>

            <select
              value={ministryFilter}
              onChange={(event) =>
                setMinistryFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All ministries
              </option>

              {ministries.map(
                (ministry) => (
                  <option
                    key={ministry}
                    value={ministry}
                  >
                    {ministry}
                  </option>
                )
              )}

            </select>

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(
                  event.target
                    .value as RiskFilter
                )
              }
            >
              <option value="all">
                All risk levels
              </option>

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>

            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target
                    .value as
                    | "risk"
                    | "progress"
                    | "cost"
                )
              }
            >
              <option value="risk">
                Highest risk
              </option>

              <option value="progress">
                Highest progress
              </option>

              <option value="cost">
                Highest cost
              </option>

            </select>

          </div>

        </section>

        {/* ACTIVE FILTER */}

        {hasFilters && (
          <div className="projects-filter-status">

            <span>
              Showing{" "}
              <strong>
                {filteredProjects.length}
              </strong>{" "}
              of{" "}
              <strong>
                {projects.length}
              </strong>{" "}
              projects
            </span>

            <button
              onClick={clearFilters}
            >
              Clear filters
              <X size={14} />
            </button>

          </div>
        )}

        {/* ==================================================
            PROJECT LIST
        ================================================== */}

        <section className="projects-table-panel">

          <div className="projects-table-head">

            <div>
              <span>
                PROJECT PORTFOLIO
              </span>

              <strong>
                Priority-ranked projects
              </strong>
            </div>

            <div className="projects-count">
              <ArrowUpDown size={14} />
              {filteredProjects.length} results
            </div>

          </div>

          {loading ? (
            <LoadingState />
          ) : filteredProjects.length ===
            0 ? (
            <EmptyState
              onClear={clearFilters}
            />
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="projects-list">

              {filteredProjects.slice(0, 100).map(
                (project, index) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    rank={index + 1}
                  />
                )
              )}

            </motion.div>
          )}

        </section>

      </section>

    </main>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  note,
  icon,
  danger,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <SpotlightCard
      spotlightColor={danger ? "rgba(169, 77, 77, 0.2)" : "rgba(255, 255, 255, 0.15)"}
      className={`project-summary-card ${
        danger ? "danger" : ""
      }`}
    >

      <div className="project-summary-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {note}
      </small>

    </SpotlightCard>
  );
}


/* =========================================================
   RISK SEGMENT
========================================================= */

function RiskSegment({
  label,
  count,
  total,
  type,
}: {
  label: string;
  count: number;
  total: number;
  type:
    | "low"
    | "medium"
    | "high"
    | "critical";
}) {
  const percentage = total
    ? Math.round(
        (count / total) * 100
      )
    : 0;

  return (
    <div className="project-risk-segment">

      <div className="project-risk-segment-label">

        <span className={`risk-dot ${type}`} />

        <span>
          {label}
        </span>

        <strong>
          {count}
        </strong>

        <small>
          {percentage}%
        </small>

      </div>

      <div className="project-risk-track">

        <span
          className={type}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   PROJECT ROW
========================================================= */

const MotionLink = motion.create(Link);

function ProjectRow({
  project,
  rank,
}: {
  project: Project;
  rank: number;
}) {
  const financialGap =
    project.progress.financial -
    project.progress.physical;

  return (
    <MotionLink
      variants={itemVariants}
      href={`/projects/${project.id}`}
      className="project-row relative overflow-hidden"
    >
      <SpotlightCard
        className="h-full w-full inset-0 z-0 pointer-events-none"
        style={{ position: 'absolute' }}
        spotlightColor={project.risk.level === "critical" ? "rgba(169,77,77,0.15)" : "rgba(255,255,255,0.06)"}
      />
      <div className="project-rank relative z-10">
        {String(rank).padStart(2, "0")}
      </div>

      <div className="project-row-icon">
        <Building2 size={19} />
      </div>

      <div className="project-row-main">

        <strong>
          {project.name}
        </strong>

        <div className="project-row-meta">

          <span>
            {project.id}
          </span>

          <i />

          <span>
            {project.ministry}
          </span>

        </div>

      </div>

      <div className="project-row-location">

        <small>
          LOCATION
        </small>

        <strong>
          {project.state}
        </strong>

      </div>

      <div className="project-row-sector">

        <small>
          SECTOR
        </small>

        <strong>
          {project.sector}
        </strong>

      </div>

      <div className="project-row-progress">

        <div className="progress-label">

          <span>
            Physical
          </span>

          <strong>
            {project.progress.physical}%
          </strong>

        </div>

        <div className="progress-track">

          <span
            style={{
              width: `${project.progress.physical}%`,
            }}
          />

        </div>

        <small>
          Financial{" "}
          {project.progress.financial}%
        </small>

      </div>

      <div className="project-row-gap">

        <small>
          FIN. − PHYSICAL
        </small>

        <strong
          className={
            financialGap > 10
              ? "gap-danger"
              : financialGap > 5
              ? "gap-warning"
              : ""
          }
        >
          {financialGap > 0
            ? `+${financialGap}`
            : financialGap}
          pp
        </strong>

      </div>

      <div
        className={`project-row-risk ${project.risk.level}`}
      >

        <strong>
          {project.risk.overall}
        </strong>

        <span>
          {project.risk.level}
        </span>

      </div>

      <ChevronRight
        size={18}
        className="project-row-arrow"
      />

    </MotionLink>
  );
}


/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="projects-loading">

      <div className="projects-loader" />

      <strong>
        Loading project portfolio
      </strong>

      <span>
        Fetching current project intelligence...
      </span>

    </div>
  );
}


/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="projects-empty">

      <Search size={30} />

      <strong>
        No projects found
      </strong>

      <span>
        Try changing your search or
        filters.
      </span>

      <button onClick={onClear}>
        Clear filters
      </button>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function unique(
  values: string[]
) {
  return Array.from(
    new Set(
      values.filter(Boolean)
    )
  ).sort();
}

function formatCrore(
  value: number
) {
  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(2)}L Cr`;
  }

  if (value >= 1000) {
    return `₹${(
      value / 1000
    ).toFixed(1)}K Cr`;
  }

  return `₹${value.toLocaleString(
    "en-IN"
  )} Cr`;
}
