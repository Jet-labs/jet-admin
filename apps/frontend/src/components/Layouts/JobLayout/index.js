import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { JobsList } from "../../DrawerLists/JobDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
const AddJob = lazy(() => import("../../../pages/AddJob"));
const UpdateJob = lazy(() => import("../../../pages/UpdateJob"));
const JobHistory = lazy(() => import("../../../pages/JobHistory"));
const JobLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal" autoSaveId="job-panel-sizes">
      <ResizablePanel defaultSize={20}>
        <JobsList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route index element={<AddJob />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_JOB.code}
            element={<AddJob />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.JOB_HISTORY.code}
            element={<JobHistory />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.JOB_VIEW.code}
            element={<UpdateJob />}
          />
        </Routes>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default JobLayout;
