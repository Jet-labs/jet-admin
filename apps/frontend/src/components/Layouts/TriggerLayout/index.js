import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
// import { AppConstantsDrawerList } from "../../DrawerLists/AppConstantDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
import { TriggersDrawerList } from "../../DrawerLists/TriggerDrawerList";
const AddTrigger = lazy(() => import("../../../pages/AddTrigger"));
// const UpdateAppConstant = lazy(() =>
//   import("../../../pages/UpdateAppConstant")
// );

const TriggerLayout = () => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="app=constants-panel-sizes"
    >
      <ResizablePanel defaultSize={20}>
        {/* <AppConstantsDrawerList /> */}
        <TriggersDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddTrigger />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_TRIGGER.code}
            element={<AddTrigger />}
          />

          {/* <Route
            path={LOCAL_CONSTANTS.ROUTES.APP_CONSTANT_VIEW.code}
            element={<UpdateAppConstant />}
          /> */}
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default TriggerLayout;
