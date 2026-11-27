---
title: Visual Tour
description: Screenshots of the main Jet Admin modules and workflows.
sidebar_position: 5
---

# Visual Tour

These snapshots come from a live Jet Admin deployment. Use them to orient
yourself before following the [Quickstart](./quickstart.md).

## Application Studio

Manage applications in the sidebar, link pages, configure routes and navigation,
edit state and releases, and inspect the live layout preview without executing
data sources.

![Jet Admin Application Studio with live layout preview](/img/screenshots/applications-studio.png)

## App Page Builder

Compose rows, containers, stacks and widgets on the canvas. The inspector
exposes layout, data sources, variables, widget versions, events and responsive
overrides.

![Jet Admin app page builder](/img/screenshots/app-page-builder.png)

## Applications directory

The applications module follows the same sidebar-first pattern as the other
builders: resizable list, search, recent applications and a dedicated landing
dashboard.

![Jet Admin applications directory](/img/screenshots/applications.png)

## Application preview

Composition preview evaluates routes and navigation without executing queries,
workflows or widget actions. Widgets that cannot run in composition-only mode
show an explicit fallback.

![Jet Admin composition preview](/img/screenshots/application-preview.png)

## Data sources

The data source drawer lists every connector in the tenant with search, folder
support and inline health/test controls.

![Jet Admin data sources](/img/screenshots/data-sources.png)

## Data queries

Queries are parameterized, versionable models over a data source. The query
workspace supports SQL, REST and connector-specific editors, input definitions
and test execution.

![Jet Admin data queries](/img/screenshots/data-queries.png)

## Listeners

Listeners capture live events from streaming and webhook sources. Pipeline
actions can persist buffers, emit to app pages, call workflows and push updates
over websockets.

![Jet Admin listeners](/img/screenshots/listeners.png)

## Workflows

Workflows are Temporal-backed DAGs with conditions, loops, fan-out/join,
approvals, sub-workflows, JavaScript and data collection.

![Jet Admin workflow editor](/img/screenshots/workflows.png)

## Identity and access

Tenant users, roles and permissions are enforced with Casbin policies. Users can
be tenant admins or hold one or more granular roles.

![Jet Admin roles and permissions](/img/screenshots/iam-roles.png)

## Marketplace

Install curated templates containing pages, widgets, queries, workflows and
datasources into a tenant, then customize them like any other asset.

![Jet Admin marketplace](/img/screenshots/marketplace.png)

## Related pages

- [Applications](../applications/applications.md)
- [App Pages & Widgets](../app-pages-widgets/app-pages-widgets.md)
- [Platform architecture](../platform/architecture.md)
- [Quickstart](./quickstart.md)
