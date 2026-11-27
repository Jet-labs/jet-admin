import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

const CAPABILITIES = [
  {
    title: "Connect anything",
    description:
      "PostgreSQL, MySQL, SQL Server, MongoDB, REST, GraphQL, Kafka, MQTT, S3, Google Sheets, Stripe and dozens more behind one typed connector model.",
    badge: "DS",
  },
  {
    title: "Query and stream",
    description:
      "Parameterized SQL and HTTP queries, live listener buffers, webhooks and SSE feeds become reusable data models for every surface.",
    badge: "SQL",
  },
  {
    title: "Automate workflows",
    description:
      "Temporal-backed DAGs with conditions, loops, fan-out/join, approvals, sub-workflows, JavaScript and data collection.",
    badge: "WF",
  },
  {
    title: "Compose app pages",
    description:
      "A Craft.js canvas with rows, stacks, containers, responsive breakpoints, 40+ widgets, JavaScript expressions, events and saved sections.",
    badge: "UI",
  },
  {
    title: "Ship applications",
    description:
      "Link pages into routed applications, customize navigation shells, preview live, then publish immutable releases with rollback.",
    badge: "APP",
  },
  {
    title: "Operate safely",
    description:
      "Tenant isolation, Casbin RBAC, audit filters, versioned assets, environment bindings, consumer policies and release history.",
    badge: "IAM",
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="relative overflow-hidden border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          <div className="flex-1 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded border border-border bg-muted/30 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Open source · self-hosted · agent-ready
            </div>
            <Heading
              as="h1"
              className="text-4xl font-medium leading-tight tracking-tight text-foreground md:text-6xl"
            >
              {siteConfig.title}
            </Heading>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link
                className="inline-flex h-10 items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                to="/docs/introduction"
              >
                Get started
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
                to="/docs/getting-started/quickstart"
              >
                Quickstart
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
                to="https://github.com/Jet-labs/Jet-admin"
              >
                GitHub
              </Link>
            </div>
          </div>
          <div className="w-full max-w-lg flex-1 lg:max-w-none">
            <div className="overflow-hidden rounded border border-border bg-card shadow-md">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="bg-background p-2">
                <img
                  src="img/screenshots/applications-studio.png"
                  alt="Jet Admin Application Studio with live layout preview"
                  className="block h-auto w-full rounded border border-border shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, badge }) {
  return (
    <div className="flex flex-col gap-2 rounded border border-border bg-card p-2 transition-all hover:border-border/80">
      <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-muted/30 font-mono text-[10px] font-semibold text-primary">
        {badge}
      </div>
      <Heading as="h3" className="text-base font-medium text-foreground">
        {title}
      </Heading>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Capabilities() {
  return (
    <section className="border-b border-border bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">
            One platform from connection to release
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Jet Admin replaces the glue between internal databases, APIs,
            automations and the interfaces your team needs every day.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((capability) => (
            <FeatureCard key={capability.title} {...capability} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectMap() {
  const layers = [
    {
      label: "Connect",
      body: "Data sources, credentials, schema discovery, health checks.",
      to: "/docs/data-source",
    },
    {
      label: "Model",
      body: "Parameterized queries, live listeners and reusable widget definitions.",
      to: "/docs/data-query",
    },
    {
      label: "Automate",
      body: "Workflow DAGs, approvals, loops, JavaScript and Temporal execution.",
      to: "/docs/workflows",
    },
    {
      label: "Compose",
      body: "App pages, responsive layout, widget events, state and saved sections.",
      to: "/docs/app-pages-widgets",
    },
    {
      label: "Deliver",
      body: "Applications, routes, navigation shells, immutable releases and rollback.",
      to: "/docs/applications",
    },
  ];
  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">
            How teams build with Jet Admin
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Start at the layer you need. Every layer is independently versioned
            and scoped to the active tenant.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-5">
          {layers.map((layer, index) => (
            <Link
              key={layer.label}
              to={layer.to}
              className="group rounded border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-muted/20"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                0{index + 1}
              </span>
              <p className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary">
                {layer.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {layer.body}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded border border-border bg-card p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Agent-ready:</strong> the bundled
            MCP server exposes 130 tools for datasources, queries, listeners,
            workflows, app pages, widgets, IAM and validation so coding agents can
            inspect and operate the platform. See{" "}
            <Link className="text-primary hover:underline" to="/docs/developers/mcp-server">
              MCP server
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function ScreenshotShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const screenshots = [
    {
      title: "Application Studio",
      description:
        "Manage applications in the sidebar, edit routes and navigation, preview the live shell, and keep JSON in a resizable footer.",
      image: "img/screenshots/applications-studio.png",
    },
    {
      title: "App Page Builder",
      description:
        "Drag rows, containers, stacks and widgets. Configure responsive spans, bindings, events and data sources in one workspace.",
      image: "img/screenshots/app-page-builder.png",
    },
    {
      title: "Workflow Automation",
      description:
        "Build and operate Temporal-backed workflows with versioned definitions and exact execution controls.",
      image: "img/screenshots/workflows.png",
    },
    {
      title: "Production Preview",
      description:
        "Preview composition and release behavior before publishing, including navigation shells and route resolution.",
      image: "img/screenshots/application-preview.png",
    },
  ];

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIndex((index) => (index + 1) % screenshots.length),
      6000
    );
    return () => clearInterval(timer);
  }, [screenshots.length]);

  const active = screenshots[activeIndex];

  return (
    <section className="border-b border-border bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="relative w-full flex-1">
            <div className="overflow-hidden rounded border border-border bg-card shadow-md">
              <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-border bg-background text-xs text-foreground transition-colors hover:bg-muted/50"
                    onClick={() =>
                      setActiveIndex((index) =>
                        index === 0 ? screenshots.length - 1 : index - 1
                      )
                    }
                    aria-label="Previous screenshot"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-border bg-background text-xs text-foreground transition-colors hover:bg-muted/50"
                    onClick={() =>
                      setActiveIndex((index) => (index + 1) % screenshots.length)
                    }
                    aria-label="Next screenshot"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
              <div className="relative h-[300px] w-full overflow-hidden bg-background md:h-[400px]">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={screenshot.title}
                    className={`absolute inset-0 p-2 transition-opacity duration-500 ${
                      index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0"
                    }`}
                  >
                    <img
                      src={screenshot.image}
                      alt={screenshot.title}
                      className="h-full w-full rounded border border-border/50 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <Heading as="h3" className="text-3xl font-medium tracking-tight text-foreground">
              {active.title}
            </Heading>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {active.description}
            </p>
            <div className="flex items-center gap-1.5 pt-2">
              {screenshots.map((screenshot, index) => (
                <button
                  key={screenshot.title}
                  type="button"
                  className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to screenshot ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const points = [
    {
      title: "Self-hosted by default",
      body: "Run the full stack with Docker Compose. Your data, credentials and releases stay in your environment.",
    },
    {
      title: "Versioned, not vibes",
      body: "Queries, widgets, pages and applications compile into immutable releases with hashes, pinning and rollback.",
    },
    {
      title: "Built for operators",
      body: "Dashboards, approvals, live monitoring, saved sections and reusable widgets are first-class, not plugins.",
    },
    {
      title: "Open and extensible",
      body: "Typed widget contracts, descriptor-driven schemas, bundle export/import, a widget library and an MCP server.",
    },
  ];
  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">
            Why teams choose Jet Admin
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A practical middle ground between hand-built admin panels and
            SaaS-only low-code tools.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <div key={point.title} className="rounded border border-border bg-card p-3">
              <p className="text-sm font-semibold text-foreground">{point.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCTA() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="space-y-4 rounded border border-border bg-card p-4 shadow-sm">
          <h2 className="text-3xl font-medium tracking-tight text-foreground">
            Build your first internal application
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
            Follow the quickstart to connect a source, create a query, compose a
            page and publish a versioned application.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              to="/docs/getting-started/quickstart"
            >
              Start the quickstart
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
              to="/docs/comparisons/market-comparison"
            >
              Compare alternatives
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-muted/50"
              to="https://github.com/Jet-labs/Jet-admin"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Self-hosted application platform for data, automation, internal tools and versioned releases."
    >
      <HomepageHeader />
      <Capabilities />
      <ProjectMap />
      <ScreenshotShowcase />
      <WhySection />
      <HomepageCTA />
    </Layout>
  );
}
