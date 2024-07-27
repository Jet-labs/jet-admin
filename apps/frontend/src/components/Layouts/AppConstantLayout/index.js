import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { AppConstantsList } from "../../DrawerLists/AppConstantDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
const AddAppConstant = lazy(() => import("../../../pages/AddAppConstant"));
const UpdateAppConstant = lazy(() =>
  import("../../../pages/UpdateAppConstant")
);

const AppConstantLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="job-panel-sizes">
      <ResizablePanel defaultSize={20}>
        <AppConstantsList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddAppConstant />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_APP_CONSTANT.code}
            element={<AddAppConstant />}
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.APP_CONSTANT_VIEW.code}
            element={<UpdateAppConstant />}
          />
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default AppConstantLayout;
