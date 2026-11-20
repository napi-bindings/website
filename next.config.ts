import type { NextConfig } from "next"

/**
 * The site is a pure static export served by GitHub Pages (branch `gh-pages`).
 *
 * - With the custom domain (www.napi-bindings.dev) the site lives at the root,
 *   so NEXT_PUBLIC_BASE_PATH stays empty.
 * - To serve it from https://napi-bindings.github.io/website instead, build with
 *   NEXT_PUBLIC_BASE_PATH=/website.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
