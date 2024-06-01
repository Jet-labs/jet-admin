import CloseIcon from "@mui/icons-material/Close";
import {
  Drawer,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { lazy, useMemo, useState } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { useAuthState } from "../../contexts/authContext";
import { Navbar } from "../Navbar";
import { TableDrawerList } from "../TableDrawerList";
import { LOCAL_CONSTANTS } from "../../constants";
import ProtectedRoute from "../ProtectedRoute";
import { Loading } from "../../pages/Loading";
import { GraphDrawerList } from "../GraphDrawerList";
// import TableView from "../../pages/TableView";

const GraphView = lazy(() => import("../../pages/GraphView"));
const AddGraph = lazy(() => import("../../pages/AddGraph"));

const GraphLayout = () => {
  const theme = useTheme();
  const stickyDrawer = useMemo(() => {
    return (
      <Grid item sm={0} md={0} lg={3} xl={2}>
        <GraphDrawerList />
      </Grid>
    );
  }, []);

  return (
    <Grid container>
      {stickyDrawer}
      <Grid
        md={12}
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
