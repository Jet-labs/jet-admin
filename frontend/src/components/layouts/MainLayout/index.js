import {
  Drawer,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MainDrawerList } from "../../DrawerLists/MainDrawerList";
import { Navbar } from "../../Navbar";
import { useParams } from "react-router-dom";

export const MainLayout = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [currentPageTitle, setCurrentPageTitle] = useState("Home");
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("lg"));
  const routeParam = useParams();
  console.log({ routeParam });
  const _handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const _handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const stickyDrawer = useMemo(() => {
    return (
      <Grid item md={0} lg={0.8} xl={0.8}>
        <MainDrawerList currentPageTitle={currentPageTitle} />
      </Grid>
    );
  }, [currentPageTitle]);
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
              <FaTimes className="!text-sm" />
            </IconButton>
          </div>

          <MainDrawerList currentPageTitle={currentPageTitle} />
        </div>
      </Drawer>
    );
  }, [currentPageTitle, isDrawerOpen]);

  return (
    <Grid container>
      <Grid item xs={12} md={12}>
        <Navbar handleDrawerOpen={_handleDrawerOpen} />
      </Grid>
      {isSmallDevice ? floatingDrawer : stickyDrawer}

      <Grid
        md={12}
        lg={11.2}
        xl={11.2}
        className="!h-[calc(100vh-48px)] !overflow-y-auto"
      >
        {children}
      </Grid>
    </Grid>
  );
};
