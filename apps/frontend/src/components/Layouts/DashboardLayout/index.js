import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { DashboardsList } from "../../DrawerLists/DashboardDrawerList";
const AddDashboardView = lazy(() => import("../../../pages/AddDashboardView"));
const DashboardView = lazy(() => import("../../../pages/DashboardView"));
const DashboardEditView = lazy(() => import("../../../pages/UpdateDashboard"));

const DashboardLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={2} xl={2}>
        <DashboardsList />
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
          <Route index element={<AddDashboardView />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_DASHBOARD_LAYOUT.code}
            element={<AddDashboardView />}
          />
          <Route path={LOCAL_CONSTANTS.ROUTES.DASHBOARD_LAYOUT_VIEW.code}>
            <Route index element={<DashboardView />} />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.DASHBOARD_EDIT_VIEW.code}
              element={<DashboardEditView />}
            />
          </Route>
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default DashboardLayout;
