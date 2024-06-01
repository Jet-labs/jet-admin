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
import { LOCAL_CONSTANTS } from "../../constants";
import { DashboardLayoutsList } from "../DashboardLayoutDrawerList";

export const DrawerList = ({
  currentPageTitle,
  setCurrentPageTitle,
  isSubDrawerListOpen,
}) => {
  const theme = useTheme();

  return (
    <Grid container className="!w-full">
      <Grid
        item
        xs={isSubDrawerListOpen ? 6 : 12}
        md={isSubDrawerListOpen ? 6 : 12}
        lg={isSubDrawerListOpen ? 5 : 12}
      >
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
              onClick={() => {
                setCurrentPageTitle(LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT);
              }}
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
                        LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT ==
                        currentPageTitle
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
                        LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT ==
                        currentPageTitle
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
              onClick={() => {
                setCurrentPageTitle(LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT);
              }}
            >
              <ListItem
                disablePadding
                selected={
                  LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT == currentPageTitle
                }
                sx={{
                  borderRight:
                    LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT ==
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
              onClick={() => {
                setCurrentPageTitle?.(LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code);
              }}
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
                        LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code ==
                        currentPageTitle
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
                          LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code ==
                          currentPageTitle
                            ? "700"
                            : "500",
                      },
                    }}
                    sx={{
                      color:
                        LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code ==
                        currentPageTitle
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
              onClick={() => {
                setCurrentPageTitle?.(LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code);
              }}
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
                        LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code ==
                        currentPageTitle
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
                          LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code ==
                          currentPageTitle
                            ? "700"
                            : "500",
                      },
                    }}
                    sx={{
                      color:
                        LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code ==
                        currentPageTitle
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
              to={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code}
              key={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code}
              onClick={() => {
                setCurrentPageTitle(
                  LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.code
                );
              }}
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
      </Grid>
      {
        <Grid
          item
          xs={isSubDrawerListOpen ? 6 : 0}
          md={isSubDrawerListOpen ? 6 : 0}
          lg={isSubDrawerListOpen ? 7 : 0}
        >
          {String(currentPageTitle).includes("dashboard_layout") ? (
            <DashboardLayoutsList
              setCurrentPageTitle={setCurrentPageTitle}
              currentPageTitle={currentPageTitle}
            />
          ) : null}
        </Grid>
      }
    </Grid>
  );
};
