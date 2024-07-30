import { Tab, Tabs, useTheme } from "@mui/material";
import { useCallback, useState } from "react";
import { useAppConstants } from "../../../contexts/appConstantsContext";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../contexts/tableSchemaEditorContext";
import { useTableSchemaEditorTransformState } from "../../../contexts/tableSchemaEditorTransformContext";

export const TableSchemaEditor = ({ schema }) => {
  const theme = useTheme();
  const { dbModel } = useAppConstants();
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
  const { transform, setTransform } = useTableSchemaEditorTransformState();

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
      setTransform({ pan: tableSchema.pan, zoom: tableSchema.zoom });
      setTypes(tableSchema.types ?? []);
      setEnums(tableSchema.enums ?? []);
    }
  }, [
    setTransform,
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
    <div className="w-full">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new table`}</span>
      </div>
      <Tabs
        value={tab}
        onChange={_handleTabChange}
        style={{
          background: theme.palette.background.paper,
        }}
      >
        <Tab label="Prisma Schema builder" />
        <Tab label="GUI builder" />
        <Tab label="SQL" />
      </Tabs>
      {JSON.stringify(dbModel)}
    </div>
  );
};
