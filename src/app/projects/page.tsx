import type { Metadata } from "next"

import { Container, PageHeader } from "@/components/page-header"
import { ProjectsExplorer } from "@/components/projects-explorer"
import { projects, summarize } from "@/lib/data"

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every repository of the napi-bindings organization: build tools, language bindings, runtimes and libraries for Node-API.",
  alternates: { canonical: "/projects/" },
}

export default function ProjectsPage() {
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="napi-bindings"
        title="Projects"
        description="Build tools, language bindings, runtimes and libraries maintained by the napi-bindings organization. Each project page mirrors its repository: README, documentation, releases and recent commits."
      />
      <ProjectsExplorer projects={projects.map(summarize)} />
    </Container>
  )
}
