import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { DataSourceDrawerList } from "../../drawerLists/DataSourceDrawerList";
const AddDashboardView = lazy(() => import("../../../pages/AddDashboardView"));
const DashboardView = lazy(() => import("../../../pages/DashboardView"));

const DataSourceLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={2} xl={2}>
        <DataSourceDrawerList />
      </Grid>
      <Grid
        xs={9}
        sm={9}
        md={9}
        lg={10}
        xl={10}
        className="!h-[calc(100vh-66px)] !overflow-y-auto"
      >
        <Routes>
          <Route index element={<AddDashboardView />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_DASHBOARD_LAYOUT.code}
            element={<AddDashboardView />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.DASHBOARD_LAYOUT_VIEW.code}
            element={<DashboardView />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default DataSourceLayout;
