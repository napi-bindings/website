import { ArrowRightIcon, BlocksIcon, CpuIcon, LayersIcon, ShieldCheckIcon, TagIcon } from "lucide-react"
import Link from "next/link"

import { CodeTabs } from "@/components/code-tabs"
import { Container } from "@/components/page-header"
import { ProjectCard } from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { activity, ecosystem, latestNapiVersion, nodeApi, projects, summarize } from "@/lib/data"
import { routes } from "@/lib/site"
import { formatDate } from "@/lib/utils"

const HELLO_C = `#include <node_api.h>

static napi_value Hello(napi_env env, napi_callback_info info) {
  napi_value result;
  napi_create_string_utf8(env, "world", NAPI_AUTO_LENGTH, &result);
  return result;
}

static napi_value Init(napi_env env, napi_value exports) {
  napi_property_descriptor desc = { "hello", 0, Hello, 0, 0, 0, napi_default, 0 };
  napi_define_properties(env, exports, 1, &desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)`

const PILLARS = [
  {
    icon: ShieldCheckIcon,
    title: "ABI stable",
    text: "An addon compiled once keeps loading in later major versions of Node.js, without recompilation.",
  },
  {
    icon: CpuIcon,
    title: "Engine independent",
    text: "js_native_api.h never exposes V8. The same API is implemented by Bun, Deno, Electron, QuickJS and more.",
  },
  {
    icon: LayersIcon,
    title: "Any language",
    text: "A plain C ABI: C++, Rust, Go, Zig, C# and Swift reach it through their foreign function interfaces.",
  },
]

export default function HomePage() {
  const releases = activity()
    .filter((item) => item.type === "release")
    .slice(0, 6)
  const stableApis = nodeApi.symbols.filter((s) => !s.experimental).length

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-brand)_0%,transparent_45%)] opacity-[0.12]"
        />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit font-mono">
              Node-API {latestNapiVersion} · formerly N-API
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Native Node.js addons, <span className="text-brand">built once</span>, loaded everywhere.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              napi-bindings is the hub for Node-API: the full API reference, versions and ecosystem, together with
              open-source tooling to build addons in C, C++ and Go and to run them beyond Node.js.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="lg" render={<Link href="/node-api/" />}>
                Learn Node-API
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/node-api/reference/" />}>
                API reference
              </Button>
              <Button size="lg" variant="ghost" render={<Link href="/projects/" />}>
                Projects
              </Button>
            </div>
          </div>
          <CodeTabs
            className="bg-card shadow-sm"
            tabs={[
              { label: "hello.c", lang: "c", code: HELLO_C },
              { label: "Build with Marmotta", lang: "sh", code: 'npx marmotta build\nnode -e "console.log(require(\'./build/hello.node\').hello())"\n# world' },
              {
                label: "Go with napi-go",
                lang: "go",
                code: '// Greet returns a greeting for name.\n//\n//napi:export\nfunc Greet(name string) string { return "hello " + name }',
              },
            ]}
          />
        </Container>
      </section>

      <section className="border-b">
        <Container className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
          {[
            { value: String(latestNapiVersion), label: "latest Node-API version", href: "/node-api/versions/" },
            { value: String(stableApis), label: "documented stable APIs", href: "/node-api/reference/" },
            { value: String(ecosystem.runtimes.length), label: "runtimes implement it", href: "/ecosystem/#runtimes" },
            { value: String(projects.length), label: "napi-bindings projects", href: "/projects/" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="hover:bg-muted/50 flex flex-col gap-1 px-4 py-6 sm:px-6">
              <span className="font-mono text-3xl font-semibold tracking-tight">{stat.value}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </Link>
          ))}
        </Container>
      </section>

      <section className="py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Why Node-API</h2>
            <p className="text-muted-foreground">
              Node-API is the C interface for native addons maintained by the Node.js project. It isolates addons from
              the JavaScript engine underneath, so a compiled binary survives engine and Node.js upgrades.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <Card key={pillar.title}>
                <CardHeader>
                  <pillar.icon className="text-brand mb-2 size-5" />
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.text}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div>
            <Button variant="link" className="px-0" render={<Link href="/node-api/" />}>
              How Node-API works
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-muted/30 border-y py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex max-w-2xl flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">The napi-bindings projects</h2>
              <p className="text-muted-foreground">
                Tools and runtimes maintained by the napi-bindings organization. Every page is rebuilt from the
                repositories: README, documentation, releases and commits.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/projects/" />}>
              All projects
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={summarize(p)} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Latest releases</h2>
              <Button variant="ghost" size="sm" render={<Link href="/activity/" />}>
                All activity
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <ul className="divide-y rounded-xl border">
              {releases.map((item) =>
                item.type === "release" ? (
                  <li key={`${item.project.slug}@${item.release.tag}`}>
                    <Link
                      href={routes.projectReleases(item.project.slug)}
                      className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3"
                    >
                      <TagIcon className="text-brand size-4 shrink-0" />
                      <span className="font-mono text-sm font-medium">{item.project.name}</span>
                      <Badge variant="outline" className="font-mono">
                        {item.release.tag}
                      </Badge>
                      <span className="text-muted-foreground ml-auto text-xs">{formatDate(item.date)}</span>
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Node-API everywhere</h2>
              <Button variant="ghost" size="sm" render={<Link href="/ecosystem/" />}>
                Ecosystem
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CpuIcon className="size-4" />
                  Runtimes implementing Node-API
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {ecosystem.runtimes.map((r) => (
                  <Badge key={r.name} variant={r.project ? "default" : "secondary"} className="font-mono">
                    {r.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BlocksIcon className="size-4" />
                  Bindings for other languages
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {ecosystem.languages.map((l) => (
                  <Badge key={l.name} variant={l.project ? "default" : "secondary"}>
                    <span className="font-mono">{l.name}</span>
                    <span className="opacity-70">{l.language}</span>
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </>
  )
}
