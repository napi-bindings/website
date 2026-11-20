/**
 * Curated catalog of the napi-bindings repositories shown on the site.
 *
 * Everything that changes over time (stars, releases, commits, README, docs,
 * changelog) is synchronised from GitHub at build time by `scripts/sync-data.ts`.
 * This file only holds the editorial information that GitHub does not provide.
 *
 * To add a repository, append an entry here and rebuild.
 */

export const ORG = "napi-bindings"
export const ORG_URL = `https://github.com/${ORG}`

export const CATEGORIES = {
  "build-tools": {
    label: "Build tools",
    description: "Compile and link Node-API addons.",
  },
  bindings: {
    label: "Language bindings",
    description: "Write addons in languages other than C and C++.",
  },
  runtimes: {
    label: "Runtimes",
    description: "Node-API implemented outside of Node.js.",
  },
  libraries: {
    label: "Libraries",
    description: "Building blocks for native code and embedders.",
  },
} as const

export type CategoryId = keyof typeof CATEGORIES

export type InstallSnippet = {
  /** Short tab label, for example "npm" or "CMake". */
  label: string
  /** Shiki language id used to highlight the snippet. */
  lang: "sh" | "cmake" | "go" | "c" | "json"
  code: string
}

export type ProjectConfig = {
  slug: string
  /** `owner/name` on GitHub. */
  repo: string
  name: string
  tagline: string
  category: CategoryId
  languages: string[]
  /** Published npm packages, used for the version badge and copy buttons. */
  npm?: string[]
  /** Status shown as a badge when the project is not yet stable. */
  status?: string
  highlights: string[]
  install: InstallSnippet[]
  /** Other catalog slugs this project builds on or works with. */
  related: { slug: string; reason: string }[]
  /** Image shown on the project page, relative to the repository root. */
  image?: string
  /** Extra external links (documentation sites, registries, ...). */
  links?: { label: string; href: string }[]
}

export const PROJECTS: ProjectConfig[] = [
  {
    slug: "marmotta",
    repo: `${ORG}/marmotta`,
    name: "Marmotta",
    tagline:
      "Builds C and C++ Node-API addons with Zig: no node-gyp, no CMake, cross-compilation from a single machine.",
    category: "build-tools",
    languages: ["TypeScript", "Zig", "C", "C++"],
    npm: ["marmotta", "@napi-bindings/marmotta"],
    highlights: [
      "Ships the Node-API headers and installs Zig on demand",
      "Cross-compiles with any Zig target triple (--target)",
      "One addon for Node.js, Electron, Deno and Bun",
      "Standalone binaries, .deb/.rpm/.apk/Arch packages",
    ],
    install: [
      { label: "npm", lang: "sh", code: "npm install --save-dev marmotta\nnpx marmotta build" },
      {
        label: "Config",
        lang: "json",
        code: '{\n  "name": "hello",\n  "sources": ["src/hello.c"],\n  "outputDir": "build"\n}',
      },
      {
        label: "Cross-compile",
        lang: "sh",
        code: "npx marmotta build --target aarch64-macos\nnpx marmotta build --target x86_64-windows",
      },
    ],
    related: [
      { slug: "node-api-stub", reason: "Same goal for CMake projects: link addons without Node.js." },
      { slug: "napi-go", reason: "Also uses Zig to cross-compile addons for every platform." },
    ],
    image: "marmotta.jpg",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/marmotta" }],
  },
  {
    slug: "napi-go",
    repo: `${ORG}/napi-go`,
    name: "napi-go",
    tagline:
      "Native Node.js addons written in Go: annotated functions, structs and classes become a typed npm package.",
    category: "bindings",
    languages: ["Go", "C", "TypeScript"],
    status: "0.x",
    highlights: [
      "Go types converted automatically, with TypeScript declarations",
      "context.Context functions run in goroutines and return Promises",
      "Classes backed by Go values, with finalizers",
      "All platforms built from one machine with Zig, like napi-rs",
    ],
    install: [
      {
        label: "New addon",
        lang: "sh",
        code: "go run github.com/napi-bindings/napi-go/cmd/napi-go@latest new my-addon\ncd my-addon && npm run build:debug && npm test",
      },
      {
        label: "Go",
        lang: "go",
        code: '// Greet returns a greeting for name.\n//\n//napi:export\nfunc Greet(name string) string { return "hello " + name }',
      },
    ],
    related: [
      { slug: "node-api-stub", reason: "Explains why Go c-shared addons must not link a static stub." },
      { slug: "marmotta", reason: "Zig-based cross-compilation for C and C++ addons." },
    ],
    links: [
      { label: "pkg.go.dev", href: "https://pkg.go.dev/github.com/napi-bindings/napi-go/napi" },
    ],
  },
  {
    slug: "node-api-stub",
    repo: `${ORG}/node-api-stub`,
    name: "node-api-stub",
    tagline:
      "Links Node-API addons on every platform without Node.js installed: vendored headers and a NodeApi::NodeApi CMake target.",
    category: "build-tools",
    languages: ["C", "CMake"],
    highlights: [
      "Official Node-API 10 headers, vendored unmodified",
      "Import library and delay-load hook on Windows",
      "-U per symbol on macOS, -z undefs on ELF",
      "FetchContent, add_subdirectory or find_package",
    ],
    install: [
      {
        label: "CMake",
        lang: "cmake",
        code: 'include(FetchContent)\nFetchContent_Declare(node_api_stub\n  GIT_REPOSITORY https://github.com/napi-bindings/node-api-stub.git\n  GIT_TAG        9.0.0)\nFetchContent_MakeAvailable(node_api_stub)\n\nadd_library(my_addon MODULE addon.c)\nset_target_properties(my_addon PROPERTIES PREFIX "" SUFFIX ".node")\ntarget_link_libraries(my_addon PRIVATE NodeApi::NodeApi)',
      },
    ],
    related: [
      { slug: "marmotta", reason: "Zero-configuration alternative for C and C++ addons." },
      { slug: "napi-go", reason: "Go addons and the -Bsymbolic pitfall." },
    ],
  },
  {
    slug: "quickjs-build",
    repo: `${ORG}/quickjs-build`,
    name: "quickjs-build",
    tagline:
      "QuickJS 2026-06-04 as a static C library, with prebuilt archives for 13 native platforms and WebAssembly.",
    category: "libraries",
    languages: ["C", "CMake", "Zig"],
    highlights: [
      "Unmodified upstream QuickJS sources, almost complete ES2025",
      "Linux (glibc and musl), macOS, Windows, FreeBSD archives",
      "wasm32-wasi and wasm32-emscripten engine builds",
      "Cross-compiled with zig cc from one runner",
    ],
    install: [
      {
        label: "Link",
        lang: "sh",
        code: "cc -Iinclude my_program.c libqjs.a -lm -lpthread -ldl -o my_program",
      },
      {
        label: "CMake",
        lang: "cmake",
        code: "add_subdirectory(quickjs-build)\ntarget_link_libraries(my_program PRIVATE qjs)",
      },
    ],
    related: [{ slug: "quickjs-napi", reason: "Builds a Node-API host on top of this library." }],
    links: [{ label: "QuickJS upstream", href: "https://bellard.org/quickjs/" }],
  },
  {
    slug: "quickjs-napi",
    repo: `${ORG}/quickjs-napi`,
    name: "quickjs-napi",
    tagline:
      "A Node-API implementation for QuickJS: addons built for Node.js load unchanged, resolving napi_* from the quickjs-napi executable.",
    category: "runtimes",
    languages: ["C", "CMake"],
    status: "0.0.x",
    highlights: [
      "All 155 Node-API 10 functions implemented",
      "Runs the js-native-api, node-api and node-addon-api test suites",
      "libuv event loop: async work and thread-safe functions",
      "Embeddable through the qjsnapi.h API",
    ],
    install: [
      {
        label: "Build",
        lang: "sh",
        code: "cmake --preset unix-debug\ncmake --build --preset unix-debug\nctest --preset unix-debug",
      },
      {
        label: "Run",
        lang: "sh",
        code: "quickjs-napi -e \"console.log(require('./build/Release/addon.node').hello())\"",
      },
    ],
    related: [
      { slug: "quickjs-build", reason: "Provides the QuickJS engine it is built on." },
      { slug: "napi-go", reason: "Addons in any language load through the same ABI." },
    ],
  },
]

export function getProjectConfig(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}
