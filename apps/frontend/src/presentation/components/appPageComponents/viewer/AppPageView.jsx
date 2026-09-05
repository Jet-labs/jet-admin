/**
 * AppPageView
 *
 * Single shared view-mode renderer for an application page.
 * Owns the per-page runtime (provider + data source bootstrapper) and the
 * scrollable LayoutRenderer tree. Used by every view surface so layout,
 * scrolling and runtime semantics stay identical:
 *  - AppPageViewer (standalone page view)
 *  - DefaultAppPageSelectionLayout (pinned module landing pages)
 *
 * Callers own everything around it (headers, fullscreen, pinning) and pass
 * layout-affecting options through props. Do NOT fork this component —
 * fix scrolling/binding issues here once.
 */

import React from "react";
import PropTypes from "prop-types";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { useAppPageStateTree } from "../../../logic/appPageRuntime";
import { resolveValue } from "../../../logic/evaluationEngine";
import { migrateV1ToV2, LayoutRenderer } from "../layout/index.js";
import { AppPageWidgetSlot } from "../editor/appPageWidgetSlot";
import { AppPageDataSourceBootstrapper } from "../editor/appPageDataSourceBootstrapper";
import { ErrorBoundary } from "@jet-admin/ui";

const EmptyPageState = () => (
  <div className="flex h-full w-full items-center justify-center p-2">
    <div className="rounded border border-dashed border-border bg-card p-4 text-center">
      <p className="text-sm font-medium text-foreground">This page is empty</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Open this page in the editor and drag widgets onto the canvas.
      </p>
    </div>
  </div>
);

/**
 * Inner content rendered inside the runtime provider. Reads the live state
 * tree and threads it (plus resolveValue for conditions/repeats) into the
 * layout renderer. Must stay inside the provider — hooks, not props.
 */
const AppPageViewContent = ({ tenantID, pageID, migratedPageConfig, scrollerClassName }) => {
  const stateTree = useAppPageStateTree();

  const renderWidget = React.useCallback(
    (widgetKey, sizing, scopedStateTree) => (
      <AppPageWidgetSlot
        tenantID={tenantID}
        widgetKey={widgetKey}
        editable={false}
        sizing={sizing}
        scopedStateTree={scopedStateTree}
      />
    ),
    [tenantID]
  );

  return (
    <>
      <AppPageDataSourceBootstrapper />
      <div
        className={scrollerClassName}
        id={`printable-area-app-page-${pageID}`}
      >
        {migratedPageConfig.layout ? (
          <ErrorBoundary title="Page layout error">
            <LayoutRenderer
              node={migratedPageConfig.layout}
              renderWidget={renderWidget}
              mode="view"
              stateTree={stateTree}
              resolveValue={resolveValue}
            />
          </ErrorBoundary>
        ) : (
          <EmptyPageState />
        )}
      </div>
    </>
  );
};

AppPageViewContent.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  migratedPageConfig: PropTypes.object.isRequired,
  scrollerClassName: PropTypes.string.isRequired,
};

export const AppPageView = ({
  tenantID,
  pageID,
  pageConfig,
  syncVariablesToUrl = false,
  scrollerClassName = "w-full flex-1 min-h-0 overflow-y-auto bg-muted p-2",
}) => {
  const migratedPageConfig = React.useMemo(() => {
    if (!pageConfig) return null;
    return migrateV1ToV2(pageConfig);
  }, [pageConfig]);

  if (!migratedPageConfig) return <EmptyPageState />;

  return (
    <AppPageRuntimeProvider
      pageID={pageID}
      tenantID={tenantID}
      pageConfig={migratedPageConfig}
      syncVariablesToUrl={syncVariablesToUrl}
    >
      <AppPageViewContent
        tenantID={tenantID}
        pageID={pageID}
        migratedPageConfig={migratedPageConfig}
        scrollerClassName={scrollerClassName}
      />
    </AppPageRuntimeProvider>
  );
};

AppPageView.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Raw appPageConfig (V1 or V2 — migrated internally) */
  pageConfig: PropTypes.object.isRequired,
  syncVariablesToUrl: PropTypes.bool,
  /** Scroll-container classes. Must constrain height (flex-1 min-h-0) + overflow-y-auto. */
  scrollerClassName: PropTypes.string,
};
