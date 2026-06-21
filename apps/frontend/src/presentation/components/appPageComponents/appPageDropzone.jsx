import React, { useMemo, useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { migrateV1ToV2, LayoutEditorCanvas } from "./layout/index.js";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";
import { WidgetIdeModal } from "./WidgetIdeModal";

// Feature flag: set VITE_USE_CRAFT_EDITOR=true in .env to opt into the Craft.js editor
const USE_CRAFT_EDITOR = import.meta.env.VITE_USE_CRAFT_EDITOR === "true";
// Lazy-load so it doesn't inflate the bundle when the flag is off
const CraftLayoutEditorCanvas = USE_CRAFT_EDITOR
  ? lazy(() => import("./layout/CraftLayoutEditorCanvas.jsx"))
  : null;


export const AppPageDropzone = ({
  tenantID,
  pageID,
  pageConfig = {},
  widgets,
  setWidgets,
  layouts,
  setLayouts,
  onChangePageConfig,
}) => {
  AppPageDropzone.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    pageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pageConfig: PropTypes.object,
    widgets: PropTypes.array.isRequired,
    setWidgets: PropTypes.func.isRequired,
    layouts: PropTypes.object,
    setLayouts: PropTypes.func,
    onChangePageConfig: PropTypes.func,
  };

  // Run the V1 to V2 layout tree migration in-memory
  const migratedConfig = useMemo(() => {
    return migrateV1ToV2(pageConfig);
  }, [pageConfig]);

  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [selectedWidgetID, setSelectedWidgetID] = useState(null);

  const handleEditWidget = (widgetID) => {
    setSelectedWidgetID(widgetID);
    setIsIdeOpen(true);
  };

  const handleLayoutChange = (newLayout) => {
    if (onChangePageConfig) {
      onChangePageConfig({
        ...migratedConfig,
        layout: newLayout,
        layoutVersion: 2,
        layouts: {}, // Remove legacy grid layouts
        _legacyLayouts: migratedConfig._legacyLayouts || pageConfig.layouts,
      });
    } else if (setLayouts) {
      // Fallback if onChangePageConfig not provided
      setLayouts({});
    }
  };

  const renderWidget = React.useCallback(
    (widgetKey, sizing) => (
      <AppPageWidgetSlot
        tenantID={tenantID}
        widgetKey={widgetKey}
        editable={true}
        sizing={sizing}
      />
    ),
    [tenantID]
  );

  const editorProps = {
    layout: migratedConfig.layout,
    onChangeLayout: handleLayoutChange,
    renderWidget,
    tenantID,
    widgets,
    setWidgets,
    onEditWidget: handleEditWidget,
  };

  return (
    <div className="h-full min-h-full w-full overflow-hidden bg-transparent p-0">
      {migratedConfig.layout && (
        USE_CRAFT_EDITOR && CraftLayoutEditorCanvas ? (
          <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading editor…</div>}>
            <CraftLayoutEditorCanvas {...editorProps} />
          </Suspense>
        ) : (
          <LayoutEditorCanvas {...editorProps} />
        )
      )}

      <WidgetIdeModal
        isOpen={isIdeOpen}
        onClose={() => setIsIdeOpen(false)}
        tenantID={tenantID}
        widgetID={selectedWidgetID}
      />
    </div>
  );
};

