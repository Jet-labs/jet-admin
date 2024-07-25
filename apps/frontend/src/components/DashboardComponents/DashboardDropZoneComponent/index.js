import { Grid, IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";

import { FaTimes } from "react-icons/fa";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";

export const DashboardDropZoneComponent = ({ graphIDData, setGraphIDData }) => {
  const theme = useTheme();

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

  return (
    <div
      className="w-full h-full p-2"
      style={{ background: theme.palette.background.paper }}
    >
      <Grid
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
      </Grid>
    </div>
  );
};
