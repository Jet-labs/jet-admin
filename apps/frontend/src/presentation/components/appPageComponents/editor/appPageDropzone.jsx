import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { migrateV1ToV2, CraftLayoutEditorCanvas } from "../layout/index.js";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";
import { WidgetIdeModal } from "./widgetIdeModal";

export const AppPageDropzone = ({
  tenantID,
  pageID,
  pageConfig = {},
  widgets,
  setWidgets,
  layouts,
  setLayouts,
  onChangePageConfig,
  appPageEditorForm,
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
    appPageEditorForm: PropTypes.object,
  };

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
        layouts: {},
        _legacyLayouts: migratedConfig._legacyLayouts || pageConfig.layouts,
      });
    } else if (setLayouts) {
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
    <div className="h-full min-h-full w-full overflow-hidden bg-transparent p-0">
      {migratedConfig.layout && (
        <CraftLayoutEditorCanvas
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
