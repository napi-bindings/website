import type { Metadata } from "next"
import Link from "next/link"

import { ActivityFeed } from "@/components/activity-feed"
import { Container, PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { activity, dataGeneratedAt, projects } from "@/lib/data"
import { routes } from "@/lib/site"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Activity",
  description: "Latest releases and commits across every napi-bindings repository.",
  alternates: { canonical: "/activity/" },
}

export default function ActivityPage() {
  const items = activity({ limit: 120 })

  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="napi-bindings"
        title="Activity"
        description={`Releases and commits across the organization, newest first. Synchronised from GitHub on ${formatDate(dataGeneratedAt)}; the site is rebuilt every day and on every push.`}
      >
        {projects.map((p) => (
          <Link key={p.slug} href={routes.projectActivity(p.slug)}>
            <Badge variant="outline" className="hover:bg-muted font-mono">
              {p.name}
            </Badge>
          </Link>
        ))}
      </PageHeader>
      <div className="max-w-3xl">
        <ActivityFeed items={items} />
      </div>
    </Container>
  )
}
