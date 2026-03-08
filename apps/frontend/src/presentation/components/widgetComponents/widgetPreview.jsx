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
    // NEW: If widgetConfig has vegaSpec, render VegaWidget directly
    if (widgetConfig?.vegaSpec) {
      const WidgetComponent = WIDGETS_MAP['vega-lite']?.component;
      if (!WidgetComponent) {
        return (
          <div className="h-full w-full p-3 flex justify-center items-center">
            <span style={{ color: '#dc2626', fontSize: '12px' }}>VegaWidget not available</span>
          </div>
        );
      }

      // Parse the spec if it is a string from the database, OR deep clone if object
      let specToRender = {};
      try {
        specToRender = typeof widgetConfig.vegaSpec === 'string'
          ? JSON.parse(widgetConfig.vegaSpec)
          : JSON.parse(JSON.stringify(widgetConfig.vegaSpec));
      } catch (err) {
        return (
          <div className="h-full w-full p-3 flex justify-center items-center">
            <span style={{ color: '#dc2626', fontSize: '12px' }}>Invalid Vega Spec JSON</span>
          </div>
        );
      }

      // --- Resolve data for the spec ---
      // Check if spec.data.values references a workflow context variable: {{ctx.xxx}}
      let vegaData = [];
      let dataResolved = false;

      if (specToRender?.data && typeof specToRender.data.values === 'string') {
        const ctxMatch = specToRender.data.values.match(/\{\{ctx\.([^}]+)\}\}/);

        if (ctxMatch && workflowContext) {
          // Resolve the path against the workflow context from useWidgetRun
          const ctxPath = ctxMatch[1]; // e.g. "nodeOutput.rows" or "myData"
          const resolved = resolvePath(workflowContext, ctxPath);

          if (Array.isArray(resolved)) {
            vegaData = resolved;
            dataResolved = true;
          } else if (resolved && typeof resolved === 'object') {
            // Maybe the resolved value is a single object or has nested arrays
            // Try common array properties
            if (Array.isArray(resolved.data)) { vegaData = resolved.data; dataResolved = true; }
            else if (Array.isArray(resolved.rows)) { vegaData = resolved.rows; dataResolved = true; }
            else if (Array.isArray(resolved.items)) { vegaData = resolved.items; dataResolved = true; }
            else if (Array.isArray(resolved.values)) { vegaData = resolved.values; dataResolved = true; }
          }

          if (!dataResolved) {
            // Context path exists but data is not an array yet (workflow still running)
            vegaData = [];
            dataResolved = true;
          }
        }
      }

      // Fallback: try to extract data from the `data` prop (API response)
      if (!dataResolved && data) {
        let rawData = data;
        if (data?.workflowInstances?.data) rawData = data.workflowInstances.data;
        else if (data?.data && !Array.isArray(data?.data)) rawData = data.data;

        if (Array.isArray(rawData)) {
          vegaData = rawData;
          dataResolved = true;
        } else if (rawData && typeof rawData === 'object') {
          if (Array.isArray(rawData.data)) { vegaData = rawData.data; dataResolved = true; }
          else if (Array.isArray(rawData.rows)) { vegaData = rawData.rows; dataResolved = true; }
          else if (Array.isArray(rawData.items)) { vegaData = rawData.items; dataResolved = true; }
        }
      }

      // If the resolved data itself is a full Vega spec, use it directly
      if (vegaData && vegaData.$schema) {
        specToRender = vegaData;
      } else if (Array.isArray(vegaData)) {
        specToRender.data = { values: vegaData };
      } else {
        specToRender.data = { values: [] };
      }

      // Final safety check to prevent mutating form state by reference
      const safeSpecForEmbed = JSON.parse(JSON.stringify(specToRender));

      console.log('--- WIDGET PREVIEW TELEMETRY ---', {
        hasWorkflowContext: !!workflowContext,
        workflowContextKeys: workflowContext ? Object.keys(workflowContext) : [],
        dataResolved,
        vegaDataLength: Array.isArray(vegaData) ? vegaData.length : typeof vegaData,
        safeSpecData: safeSpecForEmbed?.data
      });

      return (
        <WidgetComponent
          widgetTitle={widgetTitle}
          widgetType="vega-lite"
          data={specToRender}
          onWidgetInit={_handleOnWidgetInit}
          refetchInterval={refetchInterval}
          refreshData={refreshData}
          widgetConfig={widgetConfig}
        />
      );
    }

    // LEGACY: Standard widget type from map
    const WidgetComponent = WIDGETS_MAP[widgetType]?.component;
    if (WidgetComponent) {
      const chartData = data?.workflowInstances?.data || data?.data || data;
      return (
        <WidgetComponent
          widgetTitle={widgetTitle}
          widgetType={widgetType}
          data={chartData}
          onWidgetInit={_handleOnWidgetInit}
          refetchInterval={refetchInterval}
          refreshData={refreshData}
          widgetConfig={widgetConfig}
        />
      );
    }

    return (
      <div className="h-full w-full p-3 flex justify-center items-center">
        <span style={{ color: '#dc2626', fontSize: '12px' }}>
          {CONSTANTS.STRINGS.WIDGET_TYPE_INVALID_ERROR}
        </span>
      </div>
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
