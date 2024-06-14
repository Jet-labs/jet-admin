import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { GraphDrawerList } from "../../drawerLists/GraphDrawerList";
import { DataSourceDrawerList } from "../../drawerLists/DataSourceDrawerList";

// import TableView from "../../pages/TableView";

const GraphView = lazy(() => import("../../../pages/GraphView"));
const AddDataSource = lazy(() => import("../../../pages/AddDataSource"));

const DataSourceLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={3} xl={2}>
        <DataSourceDrawerList />
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
          <Route index element={<AddDataSource />} />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.DATA_SOURCE_VIEW.code}
            element={<GraphView />}
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_DATA_SOURCE.code}
            element={<AddDataSource />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default DataSourceLayout;
