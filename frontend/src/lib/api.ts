"use server";

import { mockProjects } from "@/data/mock-projects";
import { Project } from "@/types/project";

/*
  Temporary data layer.

  CURRENT:
  Frontend -> Server Action -> mock-projects (CSV parsed) -> Next.js HTTP Streaming

  FUTURE:
  Frontend -> FastAPI -> PostgreSQL -> PAIMANA
*/

export async function getProjects(): Promise<Project[]> {
  return mockProjects;
}

export async function getProject(
  id: string
): Promise<Project | undefined> {
  return mockProjects.find(
    (project) => project.id === id
  );
}