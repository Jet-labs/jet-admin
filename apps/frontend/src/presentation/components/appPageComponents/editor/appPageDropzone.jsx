import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { migrateV1ToV2, CraftLayoutEditorCanvas } from "../layout/index.js";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";
import { WidgetIdeModal } from "./widgetIdeModal";

export const AppPageDropzone = ({
  tenantID,
  pageConfig = {},
  widgets,
  setWidgets,
  onChangePageConfig,
  appPageEditorForm,
}) => {
  const migratedConfig = useMemo(() => {
    return migrateV1ToV2(pageConfig);
  }, [pageConfig]);

  // The Craft canvas seeds its state once on mount and intentionally ignores
  // external layout changes (to avoid sync feedback loops). Layouts created
  // outside the canvas — e.g. "Create & Place" from the widget IDE or undo —
  // must therefore re-seed the canvas by remounting it. We detect those by
  // reference: the canvas emits treeRoot objects that flow back unchanged
  // through the form, while external edits produce a new layout object.
  const lastSyncedLayoutRef = useRef(null);
  const [canvasEpoch, setCanvasEpoch] = useState(0);

  useEffect(() => {
    const incomingLayout = migratedConfig?.layout;
    if (!incomingLayout) return;
    if (lastSyncedLayoutRef.current === null) {
      lastSyncedLayoutRef.current = incomingLayout;
      return;
    }
    if (incomingLayout !== lastSyncedLayoutRef.current) {
      // Structurally identical layouts (e.g. the refetch that follows a save)
      // must not remount the canvas — only real external edits should.
      const isStructuralChange =
        JSON.stringify(incomingLayout) !==
        JSON.stringify(lastSyncedLayoutRef.current);
      lastSyncedLayoutRef.current = incomingLayout;
      if (isStructuralChange) {
        setCanvasEpoch((epoch) => epoch + 1);
      }
    }
  }, [migratedConfig]);

  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [selectedWidgetID, setSelectedWidgetID] = useState(null);

  const handleEditWidget = (widgetID) => {
    setSelectedWidgetID(widgetID);
    setIsIdeOpen(true);
  };

  const handleLayoutChange = (newLayout) => {
    lastSyncedLayoutRef.current = newLayout;
    if (onChangePageConfig) {
      onChangePageConfig({
        ...migratedConfig,
        layout: newLayout,
        layoutVersion: 2,
        layouts: {},
        _legacyLayouts: migratedConfig._legacyLayouts || pageConfig.layouts,
      });
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

  return (
    <div className="h-full min-h-full w-full overflow-hidden bg-transparent p-0">
      {migratedConfig.layout && (
        <CraftLayoutEditorCanvas
          key={canvasEpoch}
          layout={migratedConfig.layout}
          onChangeLayout={handleLayoutChange}
          renderWidget={renderWidget}
          tenantID={tenantID}
          widgets={widgets}
          setWidgets={setWidgets}
          onEditWidget={handleEditWidget}
        />
      )}

      <WidgetIdeModal
        isOpen={isIdeOpen}
        onClose={() => setIsIdeOpen(false)}
        tenantID={tenantID}
        widgetID={selectedWidgetID}
        appPageEditorForm={appPageEditorForm}
      />
    </div>
  );
};

AppPageDropzone.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  pageConfig: PropTypes.object,
  widgets: PropTypes.array.isRequired,
  setWidgets: PropTypes.func.isRequired,
  onChangePageConfig: PropTypes.func,
  appPageEditorForm: PropTypes.object,
};
