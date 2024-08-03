import { Tab, Tabs, useTheme } from "@mui/material";
import { TableSchemaEditor } from "../../components/TableSchemaComponents/TableSchemaEditor";
import { TableSchemaEditorContextProvider } from "../../contexts/tableSchemaEditorContext";
import { TableSchemaEditorTransformContextProvider } from "../../contexts/tableSchemaEditorTransformContext";
import { useState } from "react";
import { PGSQLSchemaBuilder } from "../../components/TableSchemaComponents/PSSQLSchemaEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/Resizables";

const UpdateTableSchema = () => {
  const [tab, setTab] = useState(0);
  const _handleOnTabChange = (_, value) => {
    setTab(value);
  };
  const theme = useTheme();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <div
        className="flex flex-col items-start justify-start p-3 "
        style={{
          background: theme.palette.background.default,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start">{`Table schema editor`}</span>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="pg-schema-update-form-panel-sizes"
        className="!flex flex-col justify-start items-stretch w-100"
      >
        <ResizablePanel
          defaultSize={50}
          style={{
            borderRightWidth: 1,
            // borderColor: theme.palette.divider,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Tabs value={tab} onChange={_handleOnTabChange} className="!min-h-0">
            <Tab
              label="PS SQL editor"
              className="!font-bold !capitalize !py-2 !px-3 !min-h-0"
              sx={{ borderWidth: 1, minHeight: null, minWidth: null }}
            />
            <Tab
              label="Visual editor (Coming soon!)"
              className="!font-bold !capitalize !py-2 !px-3 !min-h-0"
              sx={{ borderWidth: 1, minHeight: null, minWidth: null }}
            />
          </Tabs>
          {tab === 0 ? <PGSQLSchemaBuilder /> : null}
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}></ResizablePanel>
      </ResizablePanelGroup>

      {/* <TableSchemaEditorTransformContextProvider>
        <TableSchemaEditorContextProvider>
          <TableSchemaEditor />
        </TableSchemaEditorContextProvider>
      </TableSchemaEditorTransformContextProvider> */}
    </div>
  );
};

export default UpdateTableSchema;
