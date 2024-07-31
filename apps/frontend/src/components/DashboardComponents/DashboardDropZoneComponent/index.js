import { Grid, IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";

import { FaTimes } from "react-icons/fa";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DashboardDropZoneComponent = ({
  graphIDData,
  setGraphIDData,
  layout,
  setLayout,
}) => {
  const theme = useTheme();
  const [layouts, setLayouts] = useState({
    lg: layout,
  });

  const [isDraggableInDropZone, setIsDraggableInDropZone] = useState(false);
  const _enableDropping = (e) => {
    e.preventDefault();
  };
  const _handleDragOverStart = () => setIsDraggableInDropZone(true);
  const _handleDragOverEnd = () => setIsDraggableInDropZone(false);

  const _handleDrop = (e) => {
    const id = e.dataTransfer.getData("text");
    console.log({ e });
    if (graphIDData && id) {
      const _graphIDData = [
        ...graphIDData,
        {
          graphID: parseInt(id.split("_")[1]),
          left: e.nativeEvent.offsetX,
          top: e.nativeEvent.offsetY,
        },
      ];
      setGraphIDData(_graphIDData);
    }
    setIsDraggableInDropZone(false);
  };

  const _handleDelete = (index) => {
    const _graphIDData = [...graphIDData];
    _graphIDData.splice(index, 1);

    setGraphIDData(_graphIDData);
  };
  const onLayoutChange = (layout, layouts) => {
    console.log({ layout, layouts });
    setLayouts({ ...layouts });
  };
  const onDrop = (layout, layoutItem, _ev) => {
    alert(
      `Element parameters:\n${JSON.stringify(
        layoutItem,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };
  const compactType = "verticle";
  return (
    <div
      className="w-full h-full p-2"
      style={{ background: theme.palette.background.paper }}
    >
      <ResponsiveReactGridLayout
        // {...props}
        style={{ background: "#f0f0f0" }}
        layouts={layouts}
        measureBeforeMount={false}
        compactType={compactType}
        preventCollision={!compactType}
        onLayoutChange={onLayoutChange}
        // onBreakpointChange={onBreakpointChange}
        onDrop={onDrop}
        isDroppable
      >
        {graphIDData.map((graph, index) => {
          return (
            <div
              className="!p-1 !h-fit !rounded"
              key={graph}
              style={{ background: theme.palette.background.default }}
            >
              <div className="!flex-row justify-end !items-center !w-full">
                <IconButton
                  aria-label="delete"
                  size="small"
                  className="!p-0 !m-0 !pb-1"
                  onClick={() => {
                    _handleDelete(index);
                  }}
                >
                  <FaTimes className="!text-sm" />
                </IconButton>
              </div>
              <div className="!flex-row justify-center !items-center !w-full">
                <GraphWidgetComponent id={graph} />
              </div>
            </div>
          );
        })}
      </ResponsiveReactGridLayout>
      {/* <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={setLayout}
        isDroppable={true}
        onDrop={(layout, layoutItem) => {
          console.log({ layout, layoutItem });
        }}
        preventCollision={true}
      >
        {graphIDData.map((graph, index) => {
          return (
            <div
              className="!p-1 !h-fit !rounded"
              key={graph}
              style={{ background: theme.palette.background.default }}
            >
              <div className="!flex-row justify-end !items-center !w-full">
                <IconButton
                  aria-label="delete"
                  size="small"
                  className="!p-0 !m-0 !pb-1"
                  onClick={() => {
                    _handleDelete(index);
                  }}
                >
                  <FaTimes className="!text-sm" />
                </IconButton>
              </div>
              <div className="!flex-row justify-center !items-center !w-full">
                <GraphWidgetComponent id={graph} />
              </div>
            </div>
          );
        })}
      </GridLayout> */}
      {/* <Grid
        className="w-full h-full  !overflow-y-auto "
        container
        onDragEnter={_handleDragOverStart}
        onDragLeave={_handleDragOverEnd}
        onDragOver={_enableDropping}
        onDrop={_handleDrop}
        gridTemplateColumns={"auto auto auto"}
      >
        {graphIDData && graphIDData.length > 0 ? (
          graphIDData.map((graph, index) => {
            return (
              <Grid item xs={6} className="!p-1 !h-fit">
                <Grid
                  xs={12}
                  className="!flex flex-row justify-end items-start"
                >
                  <IconButton
                    aria-label="delete"
                    size="small"
                    className="!p-0 !m-0 !pb-1"
                    onClick={() => {
                      _handleDelete(index);
                    }}
                  >
                    <FaTimes className="!text-sm" />
                  </IconButton>
                </Grid>
                <GraphWidgetComponent id={graph.graphID} />
              </Grid>
            );
          })
        ) : (
          <div className="!w-full !h-full flex flex-col justify-center items-center">
            <span>No graphs added to this dashboard</span>
          </div>
        )}
      </Grid> */}
    </div>
  );
};
