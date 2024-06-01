import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { DashboardLayoutsList } from "../../drawerLists/DashboardLayoutDrawerList";
const AddDashboardLayoutView = lazy(() =>
  import("../../../pages/AddDashboardLayoutView")
);
const UpdateDashboardLayoutView = lazy(() =>
  import("../../../pages/UpdateDashboardLayoutView")
);

const DashboardLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={2} xl={2}>
        <DashboardLayoutsList />
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
          {/* <Route
            index
            element={() => {
              return <div>hello</div>;
            }}
          /> */}

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_DASHBOARD_LAYOUT.code}
            element={<AddDashboardLayoutView />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.DASHBOARD_LAYOUT_VIEW.code}
            element={<UpdateDashboardLayoutView />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default DashboardLayout;
