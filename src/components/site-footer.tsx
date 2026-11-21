import Link from "next/link"

import { CookiePreferences } from "@/components/cookie-preferences"
import { Logo } from "@/components/logo"
import { PROJECTS } from "@/config/projects"
import { formatDate } from "@/lib/utils"
import { routes, siteConfig } from "@/lib/site"

const columns = [
  {
    title: "Node-API",
    links: [
      { label: "Overview", href: "/node-api/" },
      { label: "API reference", href: "/node-api/reference/" },
      { label: "Versions", href: "/node-api/versions/" },
      { label: "Ecosystem", href: "/ecosystem/" },
    ],
  },
  {
    title: "Projects",
    links: PROJECTS.map((p) => ({ label: p.name, href: routes.project(p.slug) })),
  },
  {
    title: "Upstream",
    links: [
      { label: "Node-API docs", href: siteConfig.nodeApiDocs },
      { label: "nodejs/abi-stable-node", href: "https://github.com/nodejs/abi-stable-node" },
      { label: "node-addon-api", href: "https://github.com/nodejs/node-addon-api" },
      { label: "node-addon-examples", href: "https://github.com/nodejs/node-addon-examples" },
    ],
  },
]

export function SiteFooter({ generatedAt }: { generatedAt: string }) {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">
            Native Node.js addons and tooling built on the ABI-stable Node-API.
          </p>
          <p className="text-muted-foreground text-xs">
            Data synchronised from GitHub on {formatDate(generatedAt)}.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">{column.title}</h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a href={link.href} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground text-sm">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground text-sm">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:justify-between sm:px-6">
          <p>
            © napi-bindings contributors. Code licensed under Apache-2.0. Node-API reference content © Node.js
            contributors, MIT license.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/privacy/" className="hover:text-foreground">
              Privacy
            </Link>
            <CookiePreferences />
            <a href={`${siteConfig.github}/website`} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Edit this site on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
