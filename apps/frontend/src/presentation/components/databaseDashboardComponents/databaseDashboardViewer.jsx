import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { CONSTANTS } from "../../../constants";
import { DatabaseDashboardRenderWidget } from "./databaseDashboardRenderWidget";
import { useQuery } from "@tanstack/react-query";
import { getDatabaseDashboardByIDAPI } from "../../../data/apis/databaseDashboard";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DatabaseDashboardViewer = ({
  tenantID,
  databaseDashboardID,
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const {
    isLoading: isLoadingDatabaseDashboard,
    data: databaseDashboard,
    error: loadDatabaseDashboardError,
    isFetching: isFetchingDatabaseDashboard,
    isRefetching: isRefetechingDatabaseDashboard,
    refetch: refetchDatabaseDashboard,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID),
      databaseDashboardID,
    ],
    queryFn: () =>
      getDatabaseDashboardByIDAPI({
        tenantID,
        databaseDashboardID,
      }),
    refetchOnWindowFocus: false,
  });


  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="w-full px-3 py-2 border-b border-gray-200 flex flex-col justify-center items-start">
          {databaseDashboard && (
            <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
              {databaseDashboard.databaseDashboardName}
            </h1>
          )}

          {databaseDashboard && (
            <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${databaseDashboard.databaseDashboardID} `}</span>
          )}
        </div>
      </div>
      <div className="w-full overflow-y-auto bg-slate-100 ">
        {databaseDashboard && (
          <ResponsiveReactGridLayout
            isDraggable={false}
            isResizable={false}
            style={{ minHeight: "100%" }}
            draggableCancel=".cancelSelectorName"
            layouts={databaseDashboard?.databaseDashboardConfig?.layouts}
            measureBeforeMount={false}
            breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
            onBreakpointChange={onBreakpointChange}
            resizeHandles={["ne", "se", "nw", "sw"]}
            cols={{ lg: 4, md: 3, sm: 2, xs: 2, xxs: 1 }}
            rowHeight={16}
          >
            {databaseDashboard?.databaseDashboardConfig?.widgets.map(
              (widget, index) => (
                <div key={widget} draggable={false}>
                  <DatabaseDashboardRenderWidget
                    tenantID={tenantID}
                    widget={widget}
                    index={index}
                    editable={false}
                  />
                </div>
              )
            )}
          </ResponsiveReactGridLayout>
        )}
      </div>
    </div>
  );
};
