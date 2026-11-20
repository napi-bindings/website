import { ExternalLinkIcon, PlayIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Container, PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ecosystem } from "@/lib/data"
import type { EcosystemEntry } from "@/lib/data-schema"
import { routes } from "@/lib/site"

export const metadata: Metadata = {
  title: "Ecosystem",
  description:
    "Node-API beyond C: language bindings, runtimes that implement Node-API, build tools and learning material.",
  alternates: { canonical: "/ecosystem/" },
}

/** Tools listed by the Node.js documentation (n-api.md, "Building"). */
const BUILD_TOOLS = [
  { name: "node-gyp", url: "https://github.com/nodejs/node-gyp", text: "The default build tool, based on gyp-next and bundled with npm." },
  { name: "CMake.js", url: "https://github.com/cmake-js/cmake-js", text: "Builds addons with CMake; a good fit for projects that already use it." },
  { name: "node-pre-gyp", url: "https://github.com/mapbox/node-pre-gyp", text: "node-gyp plus upload of prebuilt binaries to a server of your choice." },
  { name: "prebuild", url: "https://github.com/prebuild/prebuild", text: "Builds with node-gyp or CMake.js and uploads binaries to GitHub releases." },
  { name: "prebuildify", url: "https://github.com/prebuild/prebuildify", text: "Bundles prebuilt binaries inside the npm package itself." },
]

const OWN_TOOLS = [
  { slug: "marmotta", name: "Marmotta", text: "Zig-based builds for C and C++ addons, no node-gyp or CMake required." },
  { slug: "node-api-stub", name: "node-api-stub", text: "A CMake target that links addons on every platform without Node.js." },
]

const WRAPPERS = [
  { name: "node-addon-api", url: "https://github.com/nodejs/node-addon-api", text: "Header-only C++ wrapper maintained by the Node.js project." },
  { name: "node-addon-examples", url: "https://github.com/nodejs/node-addon-examples", text: "Examples in C, node-addon-api and NAN, side by side." },
  { name: "node-api-headers", url: "https://github.com/nodejs/node-api-headers", text: "The Node-API headers and symbol lists, as an npm package." },
]

function EntryTable({
  entries,
  id,
  title,
  description,
}: {
  entries: EcosystemEntry[]
  id: string
  title: string
  description: string
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="w-48">Language</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.url}>
                <TableCell>
                  <span className="flex items-center gap-2">
                    {e.project ? (
                      <Link href={routes.project(e.project)} className="font-mono font-medium hover:underline">
                        {e.name}
                      </Link>
                    ) : (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-mono hover:underline"
                      >
                        {e.name}
                        <ExternalLinkIcon className="text-muted-foreground size-3" />
                      </a>
                    )}
                    {e.project && <Badge>napi-bindings</Badge>}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.language}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function LinkCards({ items }: { items: { name: string; text: string; href: string; internal?: boolean }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const card = (
          <Card size="sm" className="group-hover:ring-foreground/20 h-full transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 font-mono text-sm">
                {item.name}
                {item.internal ? <Badge>napi-bindings</Badge> : <ExternalLinkIcon className="text-muted-foreground size-3" />}
              </CardTitle>
              <CardDescription>{item.text}</CardDescription>
            </CardHeader>
          </Card>
        )
        return item.internal ? (
          <Link key={item.name} href={item.href} className="group">
            {card}
          </Link>
        ) : (
          <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className="group">
            {card}
          </a>
        )
      })}
    </div>
  )
}

export default function EcosystemPage() {
  return (
    <Container className="flex flex-col gap-14 py-10">
      <PageHeader
        eyebrow="Ecosystem"
        title="Node-API beyond C"
        description="Because Node-API is a plain C ABI, other languages can bind to it and other JavaScript runtimes can implement it. The lists below are synchronised with nodejs/abi-stable-node; napi-bindings projects are highlighted."
        className="pb-0"
      />

      <EntryTable
        id="languages"
        title="Bindings for other languages"
        description="Write addons in languages other than C and C++."
        entries={ecosystem.languages}
      />

      {ecosystem.experimentalLanguages.length > 0 && (
        <EntryTable
          id="early-stage"
          title="Early-stage bindings and examples"
          description="Projects in development, or useful as examples of using a language with Node-API."
          entries={ecosystem.experimentalLanguages}
        />
      )}

      <EntryTable
        id="runtimes"
        title="Runtimes implementing Node-API"
        description="JavaScript runtimes and engines where Node-API addons can be loaded."
        entries={ecosystem.runtimes}
      />

      <p className="text-muted-foreground -mt-8 text-xs">
        As in the upstream lists, inclusion is not an endorsement: the Node-API team has not validated these projects.
      </p>

      <section id="build-tools" className="flex scroll-mt-20 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">Build and distribution tools</h2>
          <p className="text-muted-foreground text-sm">Compile addons and ship prebuilt binaries.</p>
        </div>
        <LinkCards
          items={[
            ...OWN_TOOLS.map((t) => ({ name: t.name, text: t.text, href: routes.project(t.slug), internal: true })),
            ...BUILD_TOOLS.map((t) => ({ name: t.name, text: t.text, href: t.url })),
          ]}
        />
      </section>

      <section id="official" className="flex scroll-mt-20 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">From the Node.js project</h2>
          <p className="text-muted-foreground text-sm">Libraries, headers and examples maintained by the Node-API team.</p>
        </div>
        <LinkCards items={WRAPPERS.map((w) => ({ name: w.name, text: w.text, href: w.url }))} />
      </section>

      {ecosystem.media.length > 0 && (
        <section id="talks" className="flex scroll-mt-20 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">Talks and workshops</h2>
            <p className="text-muted-foreground text-sm">Conference talks about Node-API, newest first.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.media.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noreferrer" className="group">
                <Card size="sm" className="group-hover:ring-foreground/20 h-full overflow-hidden pt-0 transition-colors">
                  {m.thumbnail && (
                    <div className="bg-muted relative aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, static export */}
                      <img src={m.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <PlayIcon className="size-10 fill-white text-white" />
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-sm">{m.title}</CardTitle>
                    <CardDescription>
                      {m.speakers} · {m.date}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
