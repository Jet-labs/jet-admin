import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { resolveWidgetData } from "@jet-admin/widgets-logic";
import PropTypes from "prop-types";
import { useCallback, useRef, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { FiChevronDown, FiChevronRight, FiCode } from "react-icons/fi";

import { Spinner } from "@jet-admin/ui";

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
  queryResults,
}) => {
  WidgetPreview.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    widgetID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    widgetTitle: PropTypes.string,
    widgetType: PropTypes.string.isRequired,
    data: PropTypes.any,
    refetchInterval: PropTypes.number,
    isFetchingData: PropTypes.bool.isRequired,
    isRefreshingData: PropTypes.bool.isRequired,
    refreshData: PropTypes.func.isRequired,
    widgetConfig: PropTypes.object,
    queryResults: PropTypes.object,
  };

  const uniqueKey = `widgetPreview_${tenantID}_${widgetID}`;
  const widgetRef = useRef();
  const [showDebug, setShowDebug] = useState(false);

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

    // Data can be passed directly from the parent (query results, etc.)
    let chartData = data?.data || data;

    // Resolve data from queryResults via the widget type's builder
    if (!chartData && queryResults) {
      chartData = resolveWidgetData({
        widgetType: resolvedType,
        widgetConfig,
        queryResults,
      });
    }

    return (
      <WidgetComponent
        widgetTitle={widgetTitle}
        widgetType={resolvedType}
        data={chartData}
        onWidgetInit={_handleOnWidgetInit}
        refetchInterval={refetchInterval}
        refreshData={refreshData}
        widgetConfig={widgetConfig}
      />
    );
  };

  // Build debug info
  const debugInfo = {
    widgetType,
    widgetConfig: widgetConfig || null,
    dataPassedToWidget: data || null,
    queryResults: queryResults ? Object.keys(queryResults) : null,
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0 widget-editor-zone">
      {isFetchingData || isRefreshingData ? (
        <div className="w-full h-full flex flex-col justify-center items-center flex-1 min-h-0" style={{ background: 'var(--we-bg-primary)' }}>
          <Spinner size={16} />
        </div>
      ) : (
        <div
            className="flex-1 min-h-0 overflow-hidden flex flex-col"
            style={{ background: 'var(--we-bg-primary)' }}
          key={uniqueKey}
          id={uniqueKey}
        >
            <div className="flex-1 min-h-0 overflow-hidden">
              {resolveComponent()}
            </div>
        </div>
      )}

      {/* Debug Panel */}
      <div className="shrink-0 border-t border-border bg-zinc-50">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-medium text-muted-foreground hover:text-foreground hover:bg-zinc-100 transition-colors"
        >
          {showDebug ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
          <FiCode className="w-3 h-3" />
          <span>Debug: Widget Config</span>
        </button>
        {showDebug && (
          <div className="px-3 pb-3 max-h-64 overflow-auto">
            <pre className="text-[0.6rem] font-mono leading-relaxed text-zinc-700 bg-zinc-100 border border-zinc-200 rounded p-2 whitespace-pre-wrap break-all">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

