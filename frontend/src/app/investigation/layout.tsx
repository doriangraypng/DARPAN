import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidence & Anomaly Review",
  description: "Investigate unusual project behavior based on predictive overrun models.",
  alternates: {
    canonical: "/investigation",
  }
};

export default function InvestigationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
