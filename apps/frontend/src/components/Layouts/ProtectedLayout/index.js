import { Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthState } from "../../../contexts/authContext";
import { Loading } from "../../../pages/Loading";
import { MainDrawerList } from "../../DrawerLists/MainDrawerList";
import { Navbar } from "../../Navbar";
import { LOCAL_CONSTANTS } from "../../../constants";

export const ProtectedLayout = () => {
  const [currentPageTitle, setCurrentPageTitle] = useState("Home");
  const { pmUser, isLoadingPMUser, dbUserError } = useAuthState();
  const navigate = useNavigate();
  useEffect(() => {
    if (dbUserError) {
      navigate(LOCAL_CONSTANTS.ROUTES.SIGNIN);
    }
  }, [dbUserError]);

  const stickyDrawer = useMemo(() => {
    return (
      <Grid item xs={1.4} sm={1} md={0.8} lg={0.8} xl={0.8}>
        <MainDrawerList currentPageTitle={currentPageTitle} />
      </Grid>
    );
  }, [currentPageTitle]);

  if (!pmUser || isLoadingPMUser)
    return (
      <div className="flex h-screen w-screen flex-col justify-center items-center overflow-hidden">
        <Loading />
      </div>
    );

  return (
    <Grid container>
      <Grid item xs={12} md={12}>
        <Navbar />
      </Grid>
      {stickyDrawer}
      <Grid
        md={11.2}
        lg={11.2}
        xl={11.2}
        xs={10.6}
        sm={11}
        item
        className="!h-[calc(100vh-48px)] !overflow-y-auto"
      >
        <Outlet />
      </Grid>
    </Grid>
  );
};
