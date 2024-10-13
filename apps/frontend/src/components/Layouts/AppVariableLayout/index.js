import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { AppVariablesDrawerList } from "../../DrawerLists/AppVariableDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
const AddAppVariable = lazy(() => import("../../../pages/AddAppVariable"));
const UpdateAppVariable = lazy(() =>
  import("../../../pages/UpdateAppVariable")
);

const AppVariableLayout = () => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="app=constants-panel-sizes"
    >
      <ResizablePanel defaultSize={20}>
        <AppVariablesDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddAppVariable />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_APP_VARIABLES.code}
            element={<AddAppVariable />}
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.APP_VARIABLES_VIEW.code}
            element={<UpdateAppVariable />}
          />
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default AppVariableLayout;
