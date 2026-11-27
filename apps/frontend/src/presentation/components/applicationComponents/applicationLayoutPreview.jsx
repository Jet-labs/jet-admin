import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { ErrorBoundary } from "@jet-admin/ui";
import { ApplicationShellFrame } from "./applicationShell";
import {
  LayoutRenderer,
  migrateV1ToV2,
} from "../appPageComponents/layout";
import { parseWidgetKey } from "../appPageComponents/editor/appPageLayoutUtils";

const PreviewWidget = ({ widgetKey, widgetByID }) => {
  const widgetID = parseWidgetKey(widgetKey);
  const widget = widgetID ? widgetByID?.[widgetID] : null;
  return (
    <div className="flex h-full min-h-[56px] w-full flex-col justify-between rounded border border-border/60 bg-card p-2 text-left">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">
          {widget?.widgetTitle || "Widget"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
          {widget?.widgetType || "widget"}
        </p>
      </div>
      <div className="mt-2 space-y-1" aria-hidden="true">
        <div className="h-1.5 w-4/5 rounded-full bg-muted" />
        <div className="h-1.5 w-3/5 rounded-full bg-muted/70" />
      </div>
    </div>
  );
};

PreviewWidget.propTypes = {
  widgetKey: PropTypes.string,
  widgetByID: PropTypes.object,
};

function PagePreview({ route, page, widgetByID }) {
  const layout = useMemo(() => {
    if (!page?.appPageConfig) return null;
    const migrated = migrateV1ToV2(page.appPageConfig);
    return migrated?.layout || null;
  }, [page?.appPageConfig]);

  if (!route) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm font-medium text-foreground">Select a route to preview</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a route and choose a linked page to see its layout here.
          </p>
        </div>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm font-medium text-foreground">Page not linked</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The route references <span className="font-mono">{route.pageAssetKey}</span>,
            but no linked page has that key. Link a page or update the route asset.
          </p>
        </div>
      </div>
    );
  }
  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-sm font-medium text-foreground">{page.appPageTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This page has no layout yet. Open the page builder to add rows and widgets.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-2 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium text-foreground">
            {route.title || page.appPageTitle || route.id}
          </span>
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
            {route.path}
          </span>
        </div>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
          Layout only
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <ErrorBoundary title="Page preview error">
          <LayoutRenderer
            node={layout}
            mode="view"
            stateTree={{
              variables: {},
              queries: {},
              widgets: {},
              application: { variables: {} },
            }}
            renderWidget={(widgetKey) => (
              <PreviewWidget widgetKey={widgetKey} widgetByID={widgetByID} />
            )}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

PagePreview.propTypes = {
  route: PropTypes.object,
  page: PropTypes.object,
  widgetByID: PropTypes.object,
};

/**
 * Live application layout preview. It renders the current (unsaved) shell
 * definition and the real page layout structure, with inert widget
 * placeholders instead of executing data sources.
 */
export function ApplicationLayoutPreview({
  definition,
  pagesByAsset = {},
  widgetByID = {},
  selectedRouteID = null,
  onSelectRoute,
  appTitle = "",
  className = "",
}) {
  const routes = Array.isArray(definition?.routes) ? definition.routes : [];
  const route = useMemo(() => {
    const navigable = routes.filter((item) => !item.path.includes(":"));
    return (
      navigable.find((item) => item.id === selectedRouteID) ||
      navigable.find((item) => item.id === definition?.shell?.homeRouteID) ||
      navigable[0] ||
      null
    );
  }, [routes, selectedRouteID, definition?.shell?.homeRouteID]);
  const page = route ? pagesByAsset[route.pageAssetKey] : null;

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden ${className}`}>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded border border-border bg-card">
        <ApplicationShellFrame
          definition={definition}
          routes={routes}
          activeRouteID={route?.id}
          basePath=""
          appTitle={appTitle}
          onNavigate={onSelectRoute || (() => {})}
        >
          <PagePreview route={route} page={page} widgetByID={widgetByID} />
        </ApplicationShellFrame>
      </div>
    </div>
  );
}

ApplicationLayoutPreview.propTypes = {
  definition: PropTypes.object,
  pagesByAsset: PropTypes.object,
  widgetByID: PropTypes.object,
  selectedRouteID: PropTypes.string,
  onSelectRoute: PropTypes.func,
  appTitle: PropTypes.string,
  className: PropTypes.string,
};
