import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { migrateV1ToV2, LayoutEditorCanvas } from "./layout/index.js";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";

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

  return (
    <div className="h-full min-h-full w-full overflow-hidden bg-slate-50/30 p-2">
      {migratedConfig.layout && (
        <LayoutEditorCanvas
          layout={migratedConfig.layout}
          onChangeLayout={handleLayoutChange}
          renderWidget={renderWidget}
          tenantID={tenantID}
          widgets={widgets}
          setWidgets={setWidgets}
        />
      )}
    </div>
  );
};
