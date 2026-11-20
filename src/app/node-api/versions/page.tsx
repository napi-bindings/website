import { InfoIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { nodeApi, symbolsByVersion } from "@/lib/data"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Node-API versions",
  description:
    "Node-API version matrix: which Node.js releases support each Node-API version and which APIs each version added.",
  alternates: { canonical: "/node-api/versions/" },
}

/** Node-API coverage of the napi-bindings projects, as stated in their READMEs. */
const PROJECT_SUPPORT = [
  { slug: "quickjs-napi", name: "quickjs-napi", support: "Implements Node-API 10 (no NAPI_EXPERIMENTAL)" },
  { slug: "napi-go", name: "napi-go", support: "Node-API 8 to 10" },
  { slug: "node-api-stub", name: "node-api-stub", support: "Headers for Node-API 10; NAPI_VERSION 8 by default" },
  { slug: "marmotta", name: "Marmotta", support: "Ships the Node-API headers with the CLI" },
]

export default function VersionsPage() {
  const byVersion = symbolsByVersion()
  const versions = [...byVersion.keys()].filter((v): v is number => v !== null).sort((a, b) => b - a)
  const unversioned = byVersion.get(null) ?? []

  return (
    <div className="flex max-w-4xl flex-col gap-12">
      <PageHeader
        eyebrow="Node-API"
        title="Versions"
        description="Node-API versions are independent from Node.js versions. Each Node-API version adds functions; an addon declares the version it needs and runs on every Node.js release that supports it."
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Version matrix</h2>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Node-API</TableHead>
                <TableHead>Supported in Node.js</TableHead>
                <TableHead className="w-24 text-right">New APIs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodeApi.versionMatrix.map((row) => (
                <TableRow key={row.version}>
                  <TableCell>
                    <a href={`#v${row.version}`} className="font-mono font-medium hover:underline">
                      {row.version}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs whitespace-normal">
                    {row.supportedIn}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {byVersion.get(Number(row.version))?.length ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-muted-foreground text-xs">
          * Node-API was experimental in those Node.js lines. Source: the{" "}
          <a
            href={`${nodeApi.source.docsUrl}#node-api-version-matrix`}
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Node.js documentation
          </a>
          .
        </p>
      </section>

      <Alert>
        <InfoIcon />
        <AlertTitle>Since Node-API 9</AlertTitle>
        <AlertDescription>
          Runtimes that support a version above 8 also support every version from 8 up, and default to 8. Define{" "}
          <code className="font-mono">NAPI_VERSION</code> to opt into newer behaviour and functions.
        </AlertDescription>
      </Alert>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">napi-bindings projects</h2>
        <ul className="divide-y rounded-xl border">
          {PROJECT_SUPPORT.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <Link href={routes.project(p.slug)} className="font-mono font-medium hover:underline">
                {p.name}
              </Link>
              <span className="text-muted-foreground">{p.support}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-xl font-semibold tracking-tight">APIs by version</h2>
        {versions.map((v) => {
          const symbols = byVersion.get(v) ?? []
          return (
            <div key={v} id={`v${v}`} className="flex scroll-mt-20 flex-col gap-3">
              <h3 className="flex items-center gap-2 font-medium">
                Node-API {v}
                <Badge variant="secondary">{symbols.length}</Badge>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {symbols.map((s) => (
                  <Link key={s.name} href={routes.symbol(s.name)}>
                    <Badge variant="outline" className="hover:bg-muted font-mono">
                      {s.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
        {unversioned.length > 0 && (
          <div id="experimental" className="flex scroll-mt-20 flex-col gap-3">
            <h3 className="flex items-center gap-2 font-medium">
              Experimental and unversioned
              <Badge variant="secondary">{unversioned.length}</Badge>
            </h3>
            <p className="text-muted-foreground text-sm">
              Experimental entries need <code className="font-mono">NAPI_EXPERIMENTAL</code>; the others are documented
              without a Node-API version (mostly types).
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unversioned.map((s) => (
                <Link key={s.name} href={routes.symbol(s.name)}>
                  <Badge variant={s.experimental ? "destructive" : "outline"} className="font-mono">
                    {s.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
