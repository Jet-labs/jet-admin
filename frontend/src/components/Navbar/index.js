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
import { BiLogInCircle, BiMenu } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthActions, useAuthState } from "../../contexts/authContext";

export const Navbar = ({ children, handleDrawerOpen }) => {
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const { signOut } = useAuthActions();
  const { pmUser } = useAuthState();

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("lg"));
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
                <BiMenu className="!text-xl" />
              </IconButton>
            )}
            <img className="!h-11 !w-14" src={logo}></img>
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
              borderRadius: 2,
              mt: 2.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
                background: "white",
              },
              "& .MuiMenu-list": {
                background: theme.palette.primary.dark,
                borderRadius: 2,
              },
            },
          }}
        >
          <MenuItem>
            {/* <ListItemIcon>
              <Phone fontSize="small" />
            </ListItemIcon> */}
            {pmUser?.username}
          </MenuItem>
          <Divider />
          <MenuItem onClick={signOut}>
            <ListItemIcon>
              <BiLogInCircle className="!text-sm" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
