import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import PropTypes from "prop-types";
import { useCallback, useRef } from "react";
import { CONSTANTS } from "../../../constants";

import { Spinner } from "@jet-admin/ui";
/**
 * Resolve a dotted path like "nodeOutput.rows" against an object.
 * Returns undefined if any part is missing.
 */
const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

export const WidgetPreview = ({
  tenantID,
  widgetID,
  widgetTitle,
  widgetType,
  data,
  refetchInterval,
  isFetchingData,
  isRefreshingData,
  refreshData,
  widgetConfig,
  workflowContext,
  runWorkflow,
  isRunningWorkflow,
}) => {
  WidgetPreview.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
    widgetTitle: PropTypes.string.isRequired,
    widgetType: PropTypes.string.isRequired,
    data: PropTypes.object,
    refetchInterval: PropTypes.number,
    isFetchingData: PropTypes.bool.isRequired,
    isRefreshingData: PropTypes.bool.isRequired,
    refreshData: PropTypes.func.isRequired,
    widgetConfig: PropTypes.object,
    workflowContext: PropTypes.object,
    runWorkflow: PropTypes.func,
    isRunningWorkflow: PropTypes.bool,
  };

  const uniqueKey = `widgetPreview_${tenantID}_${widgetID}`;
  const widgetRef = useRef();
  const _handleOnWidgetInit = useCallback(
    (ref) => {
      if (widgetRef) {
        widgetRef.current = ref.current;
      }
    },
    [widgetRef]
  );

  // Determine which component to render
  const resolveComponent = () => {
    // Resolve the widget component from the map
    const resolvedType = widgetType || 'vega-lite';
    const WidgetComponent = WIDGETS_MAP[resolvedType]?.component;

    if (!WidgetComponent) {
      return (
        <div className="h-full w-full p-3 flex justify-center items-center">
          <span style={{ color: '#dc2626', fontSize: '12px' }}>
            {CONSTANTS.STRINGS.WIDGET_TYPE_INVALID_ERROR}
          </span>
        </div>
      );
    }

    // processedData from backend is the complete spec — just pass it through
    const chartData = data?.workflowInstances?.data || data?.data || data;

    return (
      <WidgetComponent
        widgetTitle={widgetTitle}
        widgetType={resolvedType}
        data={chartData}
        onWidgetInit={_handleOnWidgetInit}
        refetchInterval={refetchInterval}
        refreshData={refreshData}
        widgetConfig={widgetConfig}
        runWorkflow={runWorkflow}
        isLoadingWorkflows={isRunningWorkflow}
      />
    );
  };

  return (
    <div className="h-full w-full flex flex-col widget-editor-zone">
      {isFetchingData || isRefreshingData ? (
        <div className="w-full h-full flex flex-col justify-center items-center" style={{ background: 'var(--we-bg-primary)' }}>
          <Spinner size={16} />
        </div>
      ) : (
        <div
            className="h-full w-full overflow-auto"
            style={{ background: 'var(--we-bg-primary)' }}
          key={uniqueKey}
          id={uniqueKey}
        >
            {resolveComponent()}
        </div>
      )}
    </div>
  );
};
