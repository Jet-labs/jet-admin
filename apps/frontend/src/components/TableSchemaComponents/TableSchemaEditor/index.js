import { useTheme } from "@mui/material";
import { useCallback, useState } from "react";
import { TableSchemaEditorCanvasContextProvider } from "../../../contexts/tableSchemaEditorCanvasContext";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../contexts/tableSchemaEditorContext";
import { useTableSchemaEditorTransformState } from "../../../contexts/tableSchemaEditorTransformContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
import { Canvas } from "../Canvas";
import { SidePanel } from "../EditorSidePanel/SidePanel";

export const TableSchemaEditor = ({ schema }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const { types, enums, tables, relationships, undoStack, redoStack } =
    useTableSchemaEditorState();

  const {
    setTypes,
    setEnums,
    setTables,
    setRelationships,
    setUndoStack,
    setRedoStack,
  } = useTableSchemaEditorActions();

  // const { saveState, setSaveState } = useSaveState();
  const { transform, setTableSchemaEditorTransform } =
    useTableSchemaEditorTransformState();

  const save = useCallback(async () => {
    const schema = {
      lastModified: new Date(),
      tables: tables,
      references: relationships,
      pan: transform.pan,
      zoom: transform.zoom,
      enums: enums,
      types: types,
    };
    localStorage.setItem("table_schema", JSON.stringify(schema));
  }, [tables, relationships, types, transform, enums]);

  const load = useCallback(async () => {
    const tableSchemaString = localStorage.getItem("table_schema");
    if (tableSchemaString) {
      const tableSchema = JSON.parse(tableSchemaString);
      setTables(tableSchema.tables);
      setRelationships(tableSchema.references);
      setTableSchemaEditorTransform({
        pan: tableSchema.pan,
        zoom: tableSchema.zoom,
      });
      setTypes(tableSchema.types ?? []);
      setEnums(tableSchema.enums ?? []);
    }
  }, [
    setTableSchemaEditorTransform,
    setRedoStack,
    setUndoStack,
    setRelationships,
    setTables,
    setTypes,
    setEnums,
  ]);

  const _handleTabChange = (event, newTab) => {
    setTab(newTab);
  };
  return (
    <div className="w-full h-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new table`}</span>
      </div>
      {/* <Tabs
        value={tab}
        onChange={_handleTabChange}
        style={{
          background: theme.palette.background.paper,
        }}
      >
        <Tab label="Prisma Schema builder" />
        <Tab label="GUI builder" />
        <Tab label="SQL" />
      </Tabs> */}
      <ResizablePanelGroup
        direction="horizontal"
        className="!flex !flex-grow !overflow-y-auto !relative"
        autoSaveId="table-schema-gui-builder-panel-sizes"
        onPointerDown={(e) => {
          // Required for onPointerLeave to trigger when a touch pointer leaves
          // https://stackoverflow.com/a/70976017/1137077
          e.target.releasePointerCapture(e.pointerId);
        }}
      >
        <ResizablePanel defaultSize={30}>
          <SidePanel />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={70}>
          <TableSchemaEditorCanvasContextProvider className="h-full w-full relative">
            <Canvas />
          </TableSchemaEditorCanvasContextProvider>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
