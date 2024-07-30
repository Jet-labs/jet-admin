import React, { useCallback, useEffect, useState } from "react";

const TableSchemaEditorTransformStateContext = React.createContext(undefined);
const TableSchemaEditorTransformActionsContext = React.createContext(undefined);

const TableSchemaEditorTransformContextProvider = ({ children }) => {
  const [transform, setTableSchemaEditorTransformInternal] = useState({
    zoom: 1,
    pan: { x: 0, y: 0 },
  });

  const setTableSchemaEditorTransform = useCallback(
    (actionOrValue) => {
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const findFirstNumber = (...values) =>
        values.find((value) => typeof value === "number" && !isNaN(value));

      setTableSchemaEditorTransformInternal((prev) => {
        if (typeof actionOrValue === "function") {
          actionOrValue = actionOrValue(prev);
        }

        return {
          zoom: clamp(
            findFirstNumber(actionOrValue.zoom, prev.zoom, 1),
            0.02,
            5
          ),
          pan: {
            x: findFirstNumber(actionOrValue.pan?.x, prev.pan?.x, 0),
            y: findFirstNumber(actionOrValue.pan?.y, prev.pan?.y, 0),
          },
        };
      });
    },
    [setTableSchemaEditorTransformInternal]
  );

  return (
    <TableSchemaEditorTransformStateContext.Provider value={{ transform }}>
      <TableSchemaEditorTransformActionsContext.Provider
        value={{ setTableSchemaEditorTransform }}
      >
        {children}
      </TableSchemaEditorTransformActionsContext.Provider>
    </TableSchemaEditorTransformStateContext.Provider>
  );
};

const useTableSchemaEditorTransformState = () => {
  const context = React.useContext(TableSchemaEditorTransformStateContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorTransformState error");
  }

  return context;
};

const useTableSchemaEditorTransformActions = () => {
  const context = React.useContext(TableSchemaEditorTransformActionsContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorTransformActions error");
  }

  return context;
};

export {
  TableSchemaEditorTransformActionsContext,
  TableSchemaEditorTransformContextProvider,
  TableSchemaEditorTransformStateContext,
  useTableSchemaEditorTransformActions,
  useTableSchemaEditorTransformState,
};
