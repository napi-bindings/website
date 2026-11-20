import { FileQuestionIcon } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

// Exported as 404.html, which GitHub Pages serves for unknown URLs.
export default function NotFound() {
  return (
    <Container className="py-24">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            This page does not exist, or it moved. Node-API symbols live under /node-api/reference/.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button render={<Link href="/" />}>Home</Button>
          <Button variant="outline" render={<Link href="/node-api/reference/" />}>
            API reference
          </Button>
        </EmptyContent>
      </Empty>
    </Container>
  )
}
