import CloseIcon from "@mui/icons-material/Close";
import {
  Drawer,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DrawerList } from "../DrawerList";
import { Navbar } from "../Navbar";

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [currentPageTitle, setCurrentPageTitle] = useState("Home");
  // const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("lg"));

  const _handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const _handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const isSubDrawerListOpen =
    String(currentPageTitle).includes("graph") ||
    String(currentPageTitle).includes("table") ||
    String(currentPageTitle).includes("dashboard_layout");

  const stickyDrawer = useMemo(() => {
    return (
      <Grid
        item
        sm={0}
        md={0}
        lg={isSubDrawerListOpen ? 4 : 2}
        xl={isSubDrawerListOpen ? 3 : 2}
      >
        <DrawerList
          setCurrentPageTitle={setCurrentPageTitle}
          currentPageTitle={currentPageTitle}
          isSubDrawerListOpen={isSubDrawerListOpen}
        />
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
              <CloseIcon />
            </IconButton>
          </div>

          <DrawerList
            setCurrentPageTitle={setCurrentPageTitle}
            currentPageTitle={currentPageTitle}
            isSubDrawerListOpen={isSubDrawerListOpen}
          />
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
        xs={12}
        sm={12}
        md={12}
        lg={isSubDrawerListOpen ? 8 : 10}
        xl={isSubDrawerListOpen ? 9 : 10}
        className="!h-[calc(100vh-66px)] !overflow-y-auto"
      >
        {children}
      </Grid>
      {/* <div className="w-full">{children}</div> */}
    </Grid>
    // <div className="w-full h-full">

    // </div>
  );
};
