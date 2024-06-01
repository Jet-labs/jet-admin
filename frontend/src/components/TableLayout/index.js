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
import { TablesList } from "../TablesDrawerList";
import { LOCAL_CONSTANTS } from "../../constants";
import ProtectedRoute from "../ProtectedRoute";
import { Loading } from "../../pages/Loading";
// import TableView from "../../pages/TableView";

const RowView = lazy(() => import("../../pages/RowView"));
const AddRow = lazy(() => import("../../pages/AddRow"));
const TableView = lazy(() => import("../../pages/TableView"));

const TableLayout = ({ children }) => {
  const navigate = useNavigate();
  const { pmUser } = useAuthState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("lg"));
  const _handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };
  const _handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const authorizedTables = useMemo(() => {
    if (pmUser) {
      const c = pmUser.extractAuthorizedTables();
      return c;
    } else {
      return null;
    }
  }, [pmUser]);

  const stickyDrawer = useMemo(() => {
    return (
      <Grid item sm={0} md={0} lg={3} xl={2}>
        <TablesList authorizedTables={authorizedTables} />
      </Grid>
    );
  }, []);
  const floatingDrawer = useMemo(() => {
    return (
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={_handleDrawerClose}
        onRequestChange={_handleDrawerClose}
        variant="temporary"
      >
        <div className="!w-full">
          <div className="flex flex-row justify-end items-center w-full">
            <IconButton onClick={_handleDrawerClose} edge="start">
              <CloseIcon />
            </IconButton>
          </div>

          <TablesList authorizedTables={authorizedTables} />
        </div>
      </Drawer>
    );
  }, [isDrawerOpen]);

  return (
    <Grid container>
      {isSmallDevice ? floatingDrawer : stickyDrawer}

      <Grid
        xs={12}
        sm={12}
        md={12}
        lg={isSmallDevice ? 12 : 9}
        xl={isSmallDevice ? 12 : 10}
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
              element={<RowView />}
            />
          </Route>
        </Routes>
        <Outlet />
      </Grid>
    </Grid>
  );
};
export default TableLayout;
