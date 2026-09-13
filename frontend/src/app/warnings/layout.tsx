import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Early Warnings",
  description: "Automated alert tracking predicting infrastructure execution failure.",
  alternates: {
    canonical: "/warnings",
  }
};

export default function WarningsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
