import { Logout, Phone } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useAuthActions, useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import { LOCAL_CONSTANTS } from "../../constants";

export const Navbar = ({ children, handleDrawerOpen }) => {
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const { signOut } = useAuthActions();
  const { pmUser } = useAuthState();

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("md"));
  const isProfileOpen = Boolean(profileAnchor);

  const _handleProfileClick = (e) => {
    setProfileAnchor(e.currentTarget);
  };
  const _handleProfileClose = () => {
    setProfileAnchor(null);
  };

  return (
    <AppBar
      position="sticky"
      className="border-b-2 "
      sx={{
        borderColor: "rgb(123, 121, 255) ",
      }}
      elevation={0}
    >
      <Toolbar className="flex flex-row justify-between w-full">
        <div className="!flex flex-row justify-start items-center">
          <div className="flex flex-row justify-start items-center">
            {isSmallDevice && (
              <IconButton
                onClick={handleDrawerOpen}
                edge="start"
                className="!mr-2"
              >
                <MenuIcon />
              </IconButton>
            )}
            <img src={logo}></img>

            {/* <span className="font-bold normal-case mx-2">
                  {currentPageTitle}
                </span> */}
            <span className="font-bold normal-case mx-3">
              {LOCAL_CONSTANTS.APP_NAME}
            </span>
          </div>
        </div>

        <IconButton
          className="!p-0"
          onClick={_handleProfileClick}
          aria-controls={isProfileOpen ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isProfileOpen ? "true" : undefined}
        >
          <Avatar></Avatar>
        </IconButton>
        <Menu
          anchorEl={profileAnchor}
          id="account-menu"
          open={isProfileOpen}
          onClose={_handleProfileClose}
          onClick={_handleProfileClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          MenuListProps={{
            "aria-labelledby": "account-menu",
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              // filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              // "&:before": {
              //   content: '""',
              //   display: "block",
              //   position: "absolute",
              //   top: 0,
              //   right: 14,
              //   width: 10,
              //   height: 10,
              //   bgcolor: "#2e2e2e",
              //   transform: "translateY(-50%) rotate(45deg)",
              //   zIndex: 0,
              // },
            },
          }}
        >
          <MenuItem>
            <ListItemIcon>
              <Phone fontSize="small" />
            </ListItemIcon>
            {pmUser?.phone_number}
          </MenuItem>
          <Divider />
          <MenuItem onClick={signOut}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
