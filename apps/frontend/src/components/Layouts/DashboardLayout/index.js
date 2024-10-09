import { lazy } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { DashboardsDrawerList } from "../../DrawerLists/DashboardDrawerList";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";
const AddDashboardView = lazy(() => import("../../../pages/AddDashboardView"));
const DashboardView = lazy(() => import("../../../pages/DashboardView"));
const DashboardEditView = lazy(() => import("../../../pages/UpdateDashboard"));

const DashboardLayout = () => {
  const pinnedDashboardID = parseInt(
    localStorage.getItem(LOCAL_CONSTANTS.STRINGS.DEFAULT_DASHBOARD_ID_STORAGE)
  );
  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId="dashboard-panel-sizes"
    >
      <ResizablePanel defaultSize={20}>
        <DashboardsDrawerList />
      </ResizablePanel>
      <ResizableHandle withHandle={true} />
      <ResizablePanel defaultSize={80}>
        <Routes>
          <Route
            index
            element={
              isNaN(pinnedDashboardID) ? (
                <AddDashboardView />
              ) : (
                <Navigate
                  to={LOCAL_CONSTANTS.ROUTES.DASHBOARD_LAYOUT_VIEW.path(
                    pinnedDashboardID
                  )}
                />
                // <AddTrigger />
              )
            }
          />

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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default DashboardLayout;
