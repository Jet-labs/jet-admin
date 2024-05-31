import { Grid, IconButton, useTheme } from "@mui/material";
import { Close, Delete } from "@mui/icons-material";
import React, { useState } from "react";
import { GraphWidgetComponent } from "../GraphWidgetComponent";

export const GraphLayoutDropZoneComponent = ({
  graphIDData,
  setGraphIDData,
}) => {
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
      style={{ background: theme.palette.divider }}
    >
      <Grid
        className="w-full h-full"
        container
        style={
          isDraggableInDropZone
            ? {
                background: theme.palette.divider,
                borderRadius: 2,
                borderWidth: 2,
                borderStyle: "dotted",
                borderColor: theme.palette.info.main,
              }
            : {
                background: theme.palette.divider,
                borderRadius: 2,
                borderWidth: 1,
                borderStyle: "dotted",
                borderColor: theme.palette.info.dark,
              }
        }
        onDragEnter={_handleDragOverStart}
        onDragLeave={_handleDragOverEnd}
        onDragOver={_enableDropping}
        onDrop={_handleDrop}
        gridTemplateColumns={"auto auto auto"}
      >
        {graphIDData?.map((graph, index) => {
          return (
            <Grid item xs={6} className="!p-1 !h-fit">
              <Grid xs={12} className="!flex flex-row justify-end items-start">
                <IconButton
                  aria-label="delete"
                  size="small"
                  className="!p-0 !m-0 !pb-1"
                  onClick={() => {
                    _handleDelete(index);
                  }}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              </Grid>
              <GraphWidgetComponent id={graph.graphID} />
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};
