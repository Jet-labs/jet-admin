import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { GraphDrawerList } from "../../DrawerLists/GraphDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
// import TableView from "../../pages/TableView";

const UpdateGraph = lazy(() => import("../../../pages/UpdateGraph"));
const AddGraph = lazy(() => import("../../../pages/AddGraph"));

const GraphLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="graph-panel-sizes">
      <ResizablePanel defaultSize={20}>
        <GraphDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddGraph />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.code}
            element={<UpdateGraph />}
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.code}
            element={<AddGraph />}
          />
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default GraphLayout;
