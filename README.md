# napi-bindings.dev

Source of [www.napi-bindings.dev](https://www.napi-bindings.dev): the reference hub for
[Node-API](https://nodejs.org/docs/latest/api/n-api.html) and the home of the
[napi-bindings](https://github.com/napi-bindings) projects.

- **Source**: branch `main` (this branch).
- **Published site**: branch `gh-pages`, written only by GitHub Actions.

## What the site contains

| Route | Content | Source |
| --- | --- | --- |
| `/` | Home: Node-API in short, projects, latest releases, ecosystem | all of the below |
| `/node-api/` | Overview of Node-API: loading, headers, versions, core concepts | written here |
| `/node-api/docs/<section>/` | Each section of the official Node-API guide | `nodejs/node` `doc/api/n-api.md` |
| `/node-api/reference/` | Searchable index of every function, type and callback | `n-api.md` + `js_native_api.h` / `node_api.h` |
| `/node-api/reference/<symbol>/` | One page per API: signature, parameters, versions, header | `n-api.md` |
| `/node-api/versions/` | Version matrix and the APIs added by each version | `n-api.md` |
| `/projects/` | Catalog with filters by category and language | `src/config/projects.ts` + GitHub |
| `/projects/<slug>/` | README, install snippets, npm, repository facts | repository |
| `/projects/<slug>/docs/…` | Every Markdown document of the repository | repository |
| `/projects/<slug>/releases/` | Release notes (CHANGELOG section as fallback) | GitHub releases |
| `/projects/<slug>/changelog/` | CHANGELOG.md | repository |
| `/projects/<slug>/activity/`, `/activity/` | Commits and releases, per project and organization-wide | repository + releases |
| `/ecosystem/` | Language bindings, runtimes, build tools, talks | `nodejs/abi-stable-node` |
| `/search-index.json` | Index used by the ⌘K search palette | generated |

## Stack

- [Next.js](https://nextjs.org) App Router with `output: "export"`: a static site, no server.
- React 19, TypeScript (`strict`), Tailwind CSS v4.
- [shadcn/ui](https://ui.shadcn.com) components in the **base-nova** style, built on
  [Base UI](https://base-ui.com) (`src/components/ui`, configured in `components.json`).
- Markdown rendered at build time with unified/remark/rehype; code highlighted with
  [Shiki](https://shiki.style); Mermaid diagrams rendered in the browser on the pages that have them.
- Data validated with [Zod](https://zod.dev) (`src/lib/data-schema.ts`).

## How the data is kept up to date

`npm run sync` (`scripts/sync-data.ts`) writes `src/generated/*.json`:

1. **Projects** (`src/config/projects.ts`): metadata, languages and releases from the GitHub API;
   README, CHANGELOG, all Markdown documents and the last 40 commits from a shallow `git clone`;
   versions and downloads from npm.
2. **Node-API reference**: `doc/api/n-api.md` and the headers from `nodejs/node`, parsed into
   sections and symbols.
3. **Ecosystem**: the binding and runtime lists and the talks from `nodejs/abi-stable-node`.

Every source is optional: when one fails, the previous value in `src/generated/` is kept
(then `data/seed.json`), so the build never breaks because of a network problem. The generated
files are committed, so `npm run build` also works offline.

The workflow `.github/workflows/deploy.yml` runs the sync and the build on every push to
`main`, every day, on demand, and when a repository of the organization sends a
`repository_dispatch` event:

```sh
gh api repos/napi-bindings/website/dispatches -f event_type=napi-bindings-updated
```

## Development

Requires Node.js 22.18 or later.

```sh
npm install
npm run dev          # http://localhost:3000
npm run sync         # refresh src/generated/ (set GITHUB_TOKEN to avoid rate limits)
npm run typecheck
npm run lint
npm run build        # static export in out/
npm start            # serve out/ locally
```

### Adding a project

Add an entry to `PROJECTS` in `src/config/projects.ts` (name, category, tagline, install
snippets, related projects), then run `npm run sync`. Pages, search, sitemap and activity
feed pick it up automatically.

### Adding UI components

```sh
npx shadcn@latest add <component>
```

## Deployment

GitHub Pages must publish from the **`gh-pages`** branch (Settings → Pages → Deploy from a
branch → `gh-pages` / root). The workflow writes the `CNAME` file for `www.napi-bindings.dev`
and a `.nojekyll` file so that `_next/` is served.

To serve the site from `https://napi-bindings.github.io/website` instead of the custom domain,
set `NEXT_PUBLIC_BASE_PATH: /website` in the workflow and remove the `cname` input.

## License

Code: [Apache-2.0](LICENSE). Node-API documentation content: © Node.js contributors, MIT license.
