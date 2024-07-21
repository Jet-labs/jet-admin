import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { JobsList } from "../../DrawerLists/JobDrawerList";
const AddJob = lazy(() => import("../../../pages/AddJob"));
const UpdateJob = lazy(() => import("../../../pages/UpdateJob"));

const JobLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={2} xl={2}>
        <JobsList />
      </Grid>
      <Grid
        xs={9}
        sm={9}
        md={9}
        lg={10}
        xl={10}
        className="!h-[calc(100vh-48px)] !overflow-y-auto"
      >
        <Routes>
          <Route index element={<AddJob />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_JOB.code}
            element={<AddJob />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.JOB_VIEW.code}
            element={<UpdateJob />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default JobLayout;
