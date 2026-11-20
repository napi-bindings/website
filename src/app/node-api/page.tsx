import { ArrowRightIcon, BookOpenIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CodeTabs } from "@/components/code-tabs"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { guideSections, latestNapiVersion, nodeApi } from "@/lib/data"
import { routes, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Node-API overview",
  description:
    "What Node-API (N-API) is, how native addons are loaded, the engine-independent headers, versioning and the core concepts.",
  alternates: { canonical: "/node-api/" },
}

const CONCEPTS = [
  {
    title: "napi_env",
    text: "The context of every call: one per add-on instance and per thread. Never cache it across threads.",
    href: routes.symbol("napi_env"),
  },
  {
    title: "napi_value and handle scopes",
    text: "Opaque handles to JavaScript values, valid until their handle scope closes.",
    href: routes.section("object-lifetime-management"),
  },
  {
    title: "References and finalizers",
    text: "napi_ref keeps a value alive beyond a scope; finalizers release native memory tied to JS objects.",
    href: routes.symbol("napi_create_reference"),
  },
  {
    title: "Status codes and exceptions",
    text: "Every call returns napi_status; JavaScript exceptions stay pending until control returns to JS.",
    href: routes.section("error-handling"),
  },
  {
    title: "Object wrap",
    text: "Bind a native instance to a JavaScript object and recover it inside method callbacks.",
    href: routes.section("object-wrap"),
  },
  {
    title: "Async work and thread-safe functions",
    text: "Run work on the libuv thread pool and call back into JavaScript from any thread.",
    href: routes.section("asynchronous-thread-safe-function-calls"),
  },
]

const LOADING_STEPS = [
  {
    title: "Compile a shared library",
    text: "The addon is a .node file: a shared library that includes node_api.h and leaves the napi_* symbols undefined.",
  },
  {
    title: "The runtime loads it",
    text: "require() / process.dlopen() maps the library and looks for the registration done by NAPI_MODULE or NAPI_MODULE_INIT.",
  },
  {
    title: "Initialization",
    text: "The runtime calls your init function with a napi_env and the exports object; you attach functions and classes.",
  },
  {
    title: "Calls resolve to the host",
    text: "Every napi_* call is served by the process that loaded the addon: node, Electron, Bun, Deno or quickjs-napi.",
  },
]

export default function NodeApiOverviewPage() {
  const jsCount = nodeApi.symbols.filter((s) => s.header === "js_native_api.h").length
  const nodeCount = nodeApi.symbols.filter((s) => s.header === "node_api.h").length

  return (
    <article className="flex max-w-4xl flex-col gap-14">
      <PageHeader
        eyebrow="Node-API"
        title="Node-API in a nutshell"
        description="Node-API (formerly N-API) is an ABI-stable C interface for building native addons. It is part of Node.js core and independent from the JavaScript engine underneath."
      >
        <Button render={<Link href="/node-api/reference/" />}>
          Browse the API reference
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button variant="outline" render={<a href={siteConfig.nodeApiDocs} target="_blank" rel="noreferrer" />}>
          Official documentation
        </Button>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Why it exists</h2>
        <div className="text-muted-foreground flex flex-col gap-3 leading-relaxed">
          <p>
            Before Node-API, native addons were written against V8 and the internals of Node.js (often through NAN).
            Every major release could change those APIs, so addons had to be recompiled, and often rewritten, for each
            version of Node.js.
          </p>
          <p>
            Node-API puts a stable C boundary between addons and the runtime. Addons compiled against one Node-API
            version keep working on every later version of Node.js, and because the interface never mentions V8, other
            runtimes can implement it too. It has been stable since Node.js 8.12.0 and is the recommended way to write
            addons.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">How an addon is loaded</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {LOADING_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-xl border p-4">
              <span className="bg-brand text-brand-foreground flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm">
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-muted-foreground text-sm">
          Linking with undefined symbols is the part toolchains struggle with: Windows needs an import library and
          macOS refuses undefined symbols by default.{" "}
          <Link href={routes.project("node-api-stub")} className="text-brand hover:underline">
            node-api-stub
          </Link>{" "}
          and{" "}
          <Link href={routes.project("marmotta")} className="text-brand hover:underline">
            Marmotta
          </Link>{" "}
          solve it for CMake and zero-config builds.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Two headers, two scopes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">js_native_api.h</CardTitle>
              <CardDescription>
                The ECMAScript surface: values, objects, functions, errors, lifetimes, promises. Engine independent and
                implementable by any runtime. <Badge variant="secondary">{jsCount} entries</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">node_api.h</CardTitle>
              <CardDescription>
                Node.js-specific parts: module registration, Buffer, async work, libuv, thread-safe functions, cleanup
                hooks. Includes js_native_api.h. <Badge variant="secondary">{nodeCount} entries</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Choosing a Node-API version</h2>
        <p className="text-muted-foreground leading-relaxed">
          Define <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">NAPI_VERSION</code> before
          including the header to target a version; without it, Node.js builds for version 8. Since version 9, runtimes
          support every version between 8 and the highest they implement, so opting into a newer version is explicit.
          The latest is <strong className="text-foreground">Node-API {latestNapiVersion}</strong>.
        </p>
        <CodeTabs
          tabs={[
            { label: "Stable version", lang: "c", code: "#define NAPI_VERSION 10\n#include <node_api.h>" },
            { label: "Experimental", lang: "c", code: "#define NAPI_EXPERIMENTAL\n#include <node_api.h>" },
            {
              label: "binding.gyp",
              lang: "json",
              code: '{\n  "targets": [{\n    "target_name": "addon",\n    "sources": ["addon.c"],\n    "defines": ["NAPI_VERSION=10"]\n  }]\n}',
            },
          ]}
        />
        <div>
          <Button variant="outline" render={<Link href="/node-api/versions/" />}>
            Version matrix and APIs per version
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Core concepts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((concept) => (
            <Link key={concept.title} href={concept.href} className="group">
              <Card className="group-hover:ring-foreground/20 h-full transition-colors">
                <CardHeader>
                  <CardTitle className="font-mono text-sm">{concept.title}</CardTitle>
                  <CardDescription>{concept.text}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Alert>
        <BookOpenIcon />
        <AlertTitle>Prefer C++, Rust or Go?</AlertTitle>
        <AlertDescription>
          <p>
            node-addon-api wraps Node-API in header-only C++ classes, napi-rs and neon do the same for Rust, and{" "}
            <Link href={routes.project("napi-go")} className="text-brand hover:underline">
              napi-go
            </Link>{" "}
            for Go. They all compile to the same ABI-stable calls.{" "}
            <Link href="/ecosystem/" className="text-brand hover:underline">
              See the ecosystem
            </Link>
            .
          </p>
        </AlertDescription>
      </Alert>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Read the guide</h2>
        <p className="text-muted-foreground">
          The guide follows the official Node.js documentation, section by section, synchronised at every build.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {guideSections.map((s) => (
            <li key={s.id}>
              <Link
                href={routes.section(s.id)}
                className="hover:bg-muted flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span>{s.title}</span>
                {s.symbols.length > 0 && (
                  <span className="text-muted-foreground font-mono text-xs">{s.symbols.length} APIs</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
