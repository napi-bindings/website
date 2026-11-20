import type { Metadata } from "next"

import { ApiExplorer, type ApiRow } from "@/components/api-explorer"
import { PageHeader } from "@/components/page-header"
import { latestNapiVersion, nodeApi } from "@/lib/data"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Node-API reference",
  description:
    "Every Node-API function, type and callback, searchable and filterable by Node-API version and header, synchronised with the Node.js documentation.",
  alternates: { canonical: "/node-api/reference/" },
}

export default function ReferencePage() {
  const rows: ApiRow[] = nodeApi.symbols.map((s) => ({
    name: s.name,
    kind: s.kind,
    napiVersion: s.napiVersion,
    experimental: s.experimental,
    deprecated: s.deprecated,
    header: s.header,
    section: s.section,
    sectionId: s.sectionId,
    summary: s.summary,
  }))

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Reference"
        title="Node-API reference"
        description={`${nodeApi.symbols.length} functions, types and callbacks from the Node.js documentation, parsed on ${formatDate(nodeApi.generatedAt)}. Filter by kind, header or the Node-API version you target.`}
      />
      <ApiExplorer rows={rows} latest={latestNapiVersion} />
    </div>
  )
}
