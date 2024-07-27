import { Grid } from "@mui/material";
import { lazy, useMemo } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { AppConstantsList } from "../../DrawerLists/AppConstantDrawerList";
const AddAppConstant = lazy(() => import("../../../pages/AddAppConstant"));
const UpdateAppConstant = lazy(() =>
  import("../../../pages/UpdateAppConstant")
);

const AppConstantLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={2} xl={2}>
        <AppConstantsList />
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
      </Grid>
    </Grid>
  );
};
export default AppConstantLayout;
