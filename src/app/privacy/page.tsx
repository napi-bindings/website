import type { Metadata } from "next"
import type { ReactNode } from "react"

import { CookiePreferences } from "@/components/cookie-preferences"
import { Container, PageHeader } from "@/components/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy",
  description: "What napi-bindings.dev measures, which cookies it sets and how to change your choice.",
  alternates: { canonical: "/privacy/" },
}

const LAST_UPDATED = "November 21, 2026"

const COOKIES = [
  { name: "_ga", purpose: "Tells visitors apart, so that visits can be counted.", duration: "2 years" },
  { name: "_ga_<id>", purpose: "Keeps the state of the current visit (session).", duration: "2 years" },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="text-muted-foreground flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  const issues = `${siteConfig.github}/website/issues`

  return (
    <Container className="flex max-w-3xl flex-col gap-10 py-10">
      <PageHeader
        eyebrow="Site"
        title="Privacy"
        description="This site measures page views with Google Analytics, and only if you agree. Nothing else is collected."
        className="pb-0"
      />

      <Section title="What is measured">
        <p>
          If you accept, Google Analytics 4 records the pages you open: the page address and title, the page you came
          from, the approximate country, the device and browser type, the language and the screen size. The site sends
          no other events, uses no advertising features and has Google signals turned off. Google Analytics 4 does not
          store IP addresses.
        </p>
        <p>
          If you decline, or make no choice, the Google tag is not loaded and no data is sent to Google. The site works
          the same either way.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>Google Analytics sets these cookies, only after you accept:</p>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Cookie</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead className="w-24">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COOKIES.map((cookie) => (
                <TableRow key={cookie.name}>
                  <TableCell className="font-mono text-xs">{cookie.name}</TableCell>
                  <TableCell className="whitespace-normal">{cookie.purpose}</TableCell>
                  <TableCell>{cookie.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          Your choice itself is kept in your browser&apos;s local storage (
          <code className="text-foreground font-mono text-xs">napi-bindings:analytics-consent</code>) for six months,
          after which the site asks again. It is never sent anywhere. The light or dark theme you pick is kept the same
          way.
        </p>
      </Section>

      <Section title="Who receives the data">
        <p>
          Google Analytics is provided by Google Ireland Limited. Google may process the data in the United States,
          under the EU-U.S. Data Privacy Framework. The analytics data is kept for two months and then deleted;
          only aggregated reports remain.
        </p>
        <p>
          The site is hosted on GitHub Pages. GitHub may log technical data, such as IP addresses, to deliver and
          secure the pages, as described in the{" "}
          <a
            href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            GitHub privacy statement
          </a>
          .
        </p>
      </Section>

      <Section title="Change your choice">
        <p>
          You can withdraw or change your choice at any time: the Google Analytics cookies are deleted and the banner
          is shown again. The same link is in the footer of every page.
        </p>
        <div>
          <CookiePreferences
            label="Change cookie preferences"
            className="text-foreground underline underline-offset-4"
          />
        </div>
        <p>
          For questions about this page, or to exercise your rights under the GDPR, contact the maintainers of the
          napi-bindings organization by{" "}
          <a href={issues} target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-4">
            opening an issue
          </a>
          . You can also lodge a complaint with your data protection authority.
        </p>
      </Section>

      <p className="text-muted-foreground text-xs">Last updated: {LAST_UPDATED}.</p>
    </Container>
  )
}
