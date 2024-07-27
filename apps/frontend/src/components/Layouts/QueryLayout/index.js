import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { QueryDrawerList } from "../../DrawerLists/QueryDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";

const AddQuery = lazy(() => import("../../../pages/AddQuery"));
const UpdateQuery = lazy(() => import("../../../pages/UpdateQuery"));
const QueryLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="query-panel-sizes">
      <ResizablePanel defaultSize={20}>
        <QueryDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddQuery />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_QUERY.code}
            element={<AddQuery />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.QUERY_VIEW.code}
            element={<UpdateQuery />}
          />
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default QueryLayout;
