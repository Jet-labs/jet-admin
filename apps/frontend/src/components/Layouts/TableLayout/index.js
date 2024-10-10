import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { TableDrawerList } from "../../DrawerLists/TableDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";

// import TableView from "../../pages/TableView";

const UpdateRow = lazy(() => import("../../../pages/UpdateRow"));
const AddRow = lazy(() => import("../../../pages/AddRow"));
const DatabaseView = lazy(() => import("../../../pages/DatabaseView"));
const TableView = lazy(() => import("../../../pages/TableView"));
const SQLEditor = lazy(() => import("../../../pages/SQLEditor"));

const TableLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="table-panel-sizes">
      <ResizablePanel defaultSize={20}>
        <TableDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<DatabaseView />} />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.SQL_EDITOR.code}
            element={<SQLEditor />}
          />

          <Route path={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.code}>
            <Route index element={<TableView />} />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_ROW.code}
              element={<AddRow />}
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ROW_VIEW.code}
              element={<UpdateRow />}
            />
          </Route>
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default TableLayout;
