import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  FaDatabase,
  FaRegChartBar,
  FaRegUser,
  FaUserLock,
} from "react-icons/fa";
import { VscDashboard } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";

export const MainDrawerList = ({ currentPageTitle }) => {
  const theme = useTheme();

  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className="!py-0 !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT}
          key={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT}
        >
          <ListItem
            disablePadding
            selected={
              LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT == currentPageTitle
            }
            sx={{
              borderRight:
                LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT == currentPageTitle
                  ? 3
                  : 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
              >
                <FaUserLock className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                    fontWeight:
                      LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT ==
                      currentPageTitle
                        ? "700"
                        : "500",
                  },
                }}
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
                primary={"Roles Management"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT}
          key={LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT}
        >
          <ListItem
            disablePadding
            selected={
              LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT == currentPageTitle
            }
            sx={{
              borderRight:
                LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT == currentPageTitle
                  ? 3
                  : 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT ==
                    currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
              >
                <FaRegUser className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                    fontWeight:
                      LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT ==
                      currentPageTitle
                        ? "700"
                        : "500",
                  },
                }}
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT ==
                    currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
                primary={"Accounts Management"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.ALL_TABLES.path()}
          key={LOCAL_CONSTANTS.ROUTES.ALL_TABLES.path()}
        >
          <ListItem
            disablePadding
            selected={
              LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code == currentPageTitle
            }
            sx={{
              borderRight:
                LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code == currentPageTitle
                  ? 3
                  : 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
              >
                <FaDatabase className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                    fontWeight:
                      LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code == currentPageTitle
                        ? "700"
                        : "500",
                  },
                }}
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
                primary={"Tables"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.path()}
          key={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.path()}
        >
          <ListItem
            disablePadding
            selected={
              LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code == currentPageTitle
            }
            sx={{
              borderRight:
                LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code == currentPageTitle
                  ? 3
                  : 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
              >
                <FaRegChartBar className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                    fontWeight:
                      LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code == currentPageTitle
                        ? "700"
                        : "500",
                  },
                }}
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code == currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
                primary={"Graphs"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
          key={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
        >
          <ListItem
            disablePadding
            selected={
              LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code ==
              currentPageTitle
            }
            sx={{
              borderRight:
                LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code ==
                currentPageTitle
                  ? 3
                  : 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code ==
                    currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
              >
                <VscDashboard className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: -2,
                    fontWeight:
                      LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code ==
                      currentPageTitle
                        ? "700"
                        : "500",
                  },
                }}
                sx={{
                  color:
                    LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code ==
                    currentPageTitle
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                }}
                primary={"Dashboards"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
    </List>
  );
};
