import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Portfolio",
  description: "Detailed priority-ranked tracking of spatial, physical, and financial disparities.",
  alternates: {
    canonical: "/projects",
  }
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
