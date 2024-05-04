import CloseIcon from "@mui/icons-material/Close";
import {
  Drawer,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DrawerList } from "../DrawerList";
import { Navbar } from "../Navbar";

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [currentPageTitle, setCurrentPageTitle] = useState("Home");
  // const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("md"));

  const _handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const _handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <Grid container>
      <Grid item xs={12} md={12}>
        <Navbar handleDrawerOpen={_handleDrawerOpen} />
      </Grid>
      {isSmallDevice ? (
        <Drawer
          anchor="left"
          open={isDrawerOpen}
          onClose={_handleDrawerClose}
          onRequestChange={_handleDrawerClose}
          variant="temporary"
        >
          <div className="!w-72">
            <div className="flex flex-row justify-end items-center w-full">
              <IconButton onClick={_handleDrawerClose} edge="start">
                <CloseIcon />
              </IconButton>
            </div>

            <DrawerList
              setCurrentPageTitle={setCurrentPageTitle}
              setIsDrawerOpen={setIsDrawerOpen}
              currentPageTitle={currentPageTitle}
            />
          </div>
        </Drawer>
      ) : (
        <Grid item sm={0} md={3} lg={2}>
          <DrawerList
            setCurrentPageTitle={setCurrentPageTitle}
            setIsDrawerOpen={setIsDrawerOpen}
            currentPageTitle={currentPageTitle}
          />
        </Grid>
      )}

      <Grid
        xs={12}
        sm={12}
        md={9}
        lg={10}
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
