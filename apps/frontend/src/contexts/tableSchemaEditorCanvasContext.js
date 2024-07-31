import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEventListener, useResizeObserver } from "usehooks-ts";
import { useTableSchemaEditorTransformState } from "./tableSchemaEditorTransformContext";

const TableSchemaEditorCanvasStateContext = React.createContext({
  canvas: {
    screenSize: {
      x: 0,
      y: 0,
    },
    viewBox: new DOMRect(),
  },
  coords: {
    toDiagramSpace(coords) {
      return coords;
    },
    toScreenSpace(coords) {
      return coords;
    },
  },
  pointer: {
    spaces: {
      screen: {
        x: 0,
        y: 0,
      },
      diagram: {
        x: 0,
        y: 0,
      },
    },
    style: "default",
    setStyle() {},
  },
});
const TableSchemaEditorCanvasActionsContext = React.createContext(undefined);

const TableSchemaEditorCanvasContextProvider = ({ children, ...attrs }) => {
  const canvasWrapRef = useRef(null);
  const { transform } = useTableSchemaEditorTransformState();
  const canvasSize = useResizeObserver({
    ref: canvasWrapRef,
    box: "content-box",
  });
  const screenSize = useMemo(
    () => ({
      x: canvasSize.width ?? 0,
      y: canvasSize.height ?? 0,
    }),
    [canvasSize.height, canvasSize.width]
  );
  const viewBoxSize = useMemo(
    () => ({
      x: screenSize.x / transform.zoom,
      y: screenSize.y / transform.zoom,
    }),
    [screenSize.x, screenSize.y, transform.zoom]
  );
  const viewBox = useMemo(
    () =>
      new DOMRect(
        transform.pan.x - viewBoxSize.x / 2,
        transform.pan.y - viewBoxSize.y / 2,
        viewBoxSize.x,
        viewBoxSize.y
      ),
    [transform.pan.x, transform.pan.y, viewBoxSize.x, viewBoxSize.y]
  );

  const toDiagramSpace = useCallback(
    (coord) => ({
      x:
        typeof coord.x === "number"
          ? (coord.x / screenSize.x) * viewBox.width + viewBox.left
          : undefined,
      y:
        typeof coord.y === "number"
          ? (coord.y / screenSize.y) * viewBox.height + viewBox.top
          : undefined,
    }),
    [
      screenSize.x,
      screenSize.y,
      viewBox.height,
      viewBox.left,
      viewBox.top,
      viewBox.width,
    ]
  );

  const toScreenSpace = useCallback(
    (coord) => ({
      x:
        typeof coord.x === "number"
          ? ((coord.x - viewBox.left) / viewBox.width) * screenSize.x
          : undefined,
      y:
        typeof coord.y === "number"
          ? ((coord.y - viewBox.top) / viewBox.height) * screenSize.y
          : undefined,
    }),
    [
      screenSize.x,
      screenSize.y,
      viewBox.height,
      viewBox.left,
      viewBox.top,
      viewBox.width,
    ]
  );

  const [pointerScreenCoords, setPointerScreenCoords] = useState({
    x: 0,
    y: 0,
  });
  const pointerDiagramCoords = useMemo(
    () => toDiagramSpace(pointerScreenCoords),
    [pointerScreenCoords, toDiagramSpace]
  );
  const [pointerStyle, setPointerStyle] = useState("default");

  /**
   * @param {PointerEvent} e
   */
  function detectPointerMovement(e) {
    const targetElm = /** @type {HTMLElement | null} */ (e.currentTarget);
    if (!e.isPrimary || !targetElm) return;

    const canvasBounds = targetElm.getBoundingClientRect();

    setPointerScreenCoords({
      x: e.clientX - canvasBounds.left,
      y: e.clientY - canvasBounds.top,
    });
  }

  // Important for touch screen devices!
  useEventListener("pointerdown", detectPointerMovement, canvasWrapRef);

  useEventListener("pointermove", detectPointerMovement, canvasWrapRef);

  const contextValue = {
    canvas: {
      screenSize,
      viewBox,
    },
    coords: {
      toDiagramSpace,
      toScreenSpace,
    },
    pointer: {
      spaces: {
        screen: pointerScreenCoords,
        diagram: pointerDiagramCoords,
      },
      style: pointerStyle,
      setStyle: setPointerStyle,
    },
  };

  return (
    <TableSchemaEditorCanvasStateContext.Provider value={contextValue}>
      <TableSchemaEditorCanvasActionsContext.Provider value={{}}>
        <div {...attrs} ref={canvasWrapRef}>
          {children}
        </div>
      </TableSchemaEditorCanvasActionsContext.Provider>
    </TableSchemaEditorCanvasStateContext.Provider>
  );
};

const useTableSchemaEditorCanvasState = () => {
  const context = React.useContext(TableSchemaEditorCanvasStateContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorCanvasState error");
  }

  return context;
};

const useTableSchemaEditorCanvasActions = () => {
  const context = React.useContext(TableSchemaEditorCanvasActionsContext);
  if (context === undefined) {
    throw new Error("useTableSchemaEditorCanvasActions error");
  }

  return context;
};

export {
  TableSchemaEditorCanvasActionsContext,
  TableSchemaEditorCanvasContextProvider,
  TableSchemaEditorCanvasStateContext,
  useTableSchemaEditorCanvasActions,
  useTableSchemaEditorCanvasState,
};
