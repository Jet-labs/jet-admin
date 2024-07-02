import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { QueryDrawerList } from "../../DrawerLists/QueryDrawerList";

const AddQuery = lazy(() => import("../../../pages/AddQuery"));
const UpdateQuery = lazy(() => import("../../../pages/UpdateQuery"));
const QueryLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={3} xl={2}>
        <QueryDrawerList />
      </Grid>
      <Grid
        xs={9}
        sm={9}
        md={9}
        lg={9}
        xl={10}
        className="!h-[calc(100vh-66px)] !overflow-y-auto"
      >
        <Routes>
          <Route index element={<AddQuery />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_QUERY.code}
            element={<AddQuery />}
          />
          <Route
            path={LOCAL_CONSTANTS.ROUTES.QUERY_VIEW.code}
            element={<UpdateQuery />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default QueryLayout;
