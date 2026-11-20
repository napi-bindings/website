import { ArrowUpRightIcon, BookOpenIcon, BoxIcon, CpuIcon, HammerIcon, LanguagesIcon, StarIcon, TagIcon } from "lucide-react"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryId } from "@/config/projects"
import type { ProjectSummary } from "@/lib/project-summary"
import { routes } from "@/lib/site"
import { formatCount, formatDate } from "@/lib/utils"

export const CATEGORY_ICONS: Record<CategoryId, typeof HammerIcon> = {
  "build-tools": HammerIcon,
  bindings: LanguagesIcon,
  runtimes: CpuIcon,
  libraries: BoxIcon,
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const Icon = CATEGORY_ICONS[project.category]
  return (
    <Card className="group/project relative h-full transition-colors hover:ring-foreground/20">
      <CardHeader>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Icon className="size-3.5" />
          {project.categoryLabel}
        </div>
        <CardTitle className="font-mono text-base">
          <Link href={routes.project(project.slug)} className="after:absolute after:inset-0">
            {project.name}
          </Link>
        </CardTitle>
        <CardAction>{project.status && <Badge variant="outline">{project.status}</Badge>}</CardAction>
        <CardDescription className="line-clamp-3">{project.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        {project.languages.map((lang) => (
          <Badge key={lang} variant="secondary">
            {lang}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="text-muted-foreground mt-auto flex-wrap gap-x-4 gap-y-2 text-xs">
        <span className="flex items-center gap-1" title="GitHub stars">
          <StarIcon className="size-3.5" />
          {formatCount(project.stars)}
        </span>
        {project.latestTag && (
          <span className="flex items-center gap-1 font-mono" title={`Released ${formatDate(project.latestDate)}`}>
            <TagIcon className="size-3.5" />
            {project.latestTag}
          </span>
        )}
        {project.docsCount > 0 && (
          <span className="flex items-center gap-1">
            <BookOpenIcon className="size-3.5" />
            {project.docsCount} docs
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          className="relative z-10 ml-auto"
          aria-label={`${project.name} on GitHub`}
          render={<a href={`https://github.com/${project.repo}`} target="_blank" rel="noreferrer" />}
        >
          <GitHubIcon />
        </Button>
        <ArrowUpRightIcon className="size-4 transition-transform group-hover/project:translate-x-0.5 group-hover/project:-translate-y-0.5" />
      </CardFooter>
    </Card>
  )
}
