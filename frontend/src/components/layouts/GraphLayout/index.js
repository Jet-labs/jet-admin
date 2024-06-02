import { Grid } from "@mui/material";
import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { GraphDrawerList } from "../../drawerLists/GraphDrawerList";
// import TableView from "../../pages/TableView";

const GraphView = lazy(() => import("../../../pages/GraphView"));
const AddGraph = lazy(() => import("../../../pages/AddGraph"));

const GraphLayout = () => {
  return (
    <Grid container>
      <Grid item xs={3} sm={3} md={3} lg={3} xl={2}>
        <GraphDrawerList />
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
          {/* <Route
            index
            element={() => {
              return <div>hello</div>;
            }}
          /> */}

          <Route
            path={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.code}
            element={<GraphView />}
          />

          <Route
            path={LOCAL_CONSTANTS.ROUTES.ADD_GRAPH.code}
            element={<AddGraph />}
          />
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default GraphLayout;
