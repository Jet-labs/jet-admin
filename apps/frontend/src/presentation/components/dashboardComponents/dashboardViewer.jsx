import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CONSTANTS } from "../../../constants";
import { getDashboardByIDAPI } from "../../../data/apis/dashboard";
import { DashboardPrintForm } from "./dashboardPrintForm";
import { DashboardRenderWidget } from "./dashboardRenderWidget";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DashboardViewer = ({ tenantID, dashboardID }) => {
  DashboardViewer.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dashboardID: PropTypes.number.isRequired,
  };

  // eslint-disable-next-line no-unused-vars
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    isFetching: isFetchingDashboard,
    isRefetching: isRefetechingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID), dashboardID],
    queryFn: () =>
      getDashboardByIDAPI({
        tenantID,
        dashboardID,
      }),
    refetchOnWindowFocus: false,
  });

  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-gray-200 ">
        <div className="w-full  flex flex-col justify-center items-start">
          {dashboard && (
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
              {dashboard.dashboardTitle}
            </h1>
          )}

          {dashboard && (
            <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${dashboard.dashboardID} `}</span>
          )}
        </div>
        <div className="flex flex-row justify-end items-center">
          <DashboardPrintForm dashboardID={dashboardID} />
        </div>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDashboard}
        isFetching={isFetchingDashboard}
        error={loadDashboardError}
        refetch={refetchDashboard}
        isRefetching={isRefetechingDashboard}
      >
        <div
          className="w-full overflow-y-auto bg-slate-100 "
          id={`printable-area-dashboard-${dashboardID}`}
        >
          {dashboard && (
            <ResponsiveReactGridLayout
              isDraggable={false}
              isResizable={false}
              style={{ minHeight: "100%" }}
              draggableCancel=".cancelSelectorName"
              layouts={dashboard?.dashboardConfig?.layouts}
              measureBeforeMount={false}
              breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
              onBreakpointChange={onBreakpointChange}
              resizeHandles={["ne", "se", "nw", "sw"]}
              margin={[8, 8]}
              cols={{ lg: 8, md: 6, sm: 5, xs: 4, xxs: 3 }}
              rowHeight={32}
              allowOverlap={false}
            >
              {dashboard?.dashboardConfig?.widgets.map((widget, index) => (
                <div key={widget} draggable={false}>
                  <DashboardRenderWidget
                    tenantID={tenantID}
                    widget={widget}
                    index={index}
                    editable={false}
                  />
                </div>
              ))}
            </ResponsiveReactGridLayout>
          )}
        </div>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
