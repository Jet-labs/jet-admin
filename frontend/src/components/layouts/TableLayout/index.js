import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { TableDrawerList } from "../../DrawerLists/TableDrawerList";
// import TableView from "../../pages/TableView";

const UpdateRow = lazy(() => import("../../../pages/UpdateRow"));
const AddRow = lazy(() => import("../../../pages/AddRow"));
const TableView = lazy(() => import("../../../pages/TableView"));

const TableLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={3} xl={2}>
        <TableDrawerList />
      </Grid>
      <Grid
        item
        xs={9}
        sm={9}
        md={9}
        lg={9}
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
          <Route path={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.code}>
            <Route index element={<TableView />} />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ADD_ROW.code}
              element={<AddRow />}
            />
            <Route
              path={LOCAL_CONSTANTS.ROUTES.ROW_VIEW.code}
              element={<UpdateRow />}
            />
          </Route>
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default TableLayout;
