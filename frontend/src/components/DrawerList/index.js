import { Dashboard, PeopleAlt, Storage } from "@mui/icons-material";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import PolicyIcon from "@mui/icons-material/Policy";
import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { TablesList } from "../TablesDrawerList";
import { GraphsDrawerList } from "../GraphsDrawerList";
import { DashboardLayoutsList } from "../DashboardLayoutDrawerList";

export const DrawerList = ({
  currentPageTitle,
  setCurrentPageTitle,
  isSubDrawerListOpen,
}) => {
  const { pmUser } = useAuthState();
  const theme = useTheme();

  const authorizedTables = useMemo(() => {
    if (pmUser) {
      const c = pmUser.extractAuthorizedTables();
      return c;
    } else {
      return null;
    }
  }, [pmUser]);

  console.log({ currentPageTitle });
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
                    <PolicyIcon sx={{}} />
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
                    <PeopleAlt sx={{}} />
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
                    <Storage sx={{}} />
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
              to={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code}
              key={LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code}
              onClick={() => {
                setCurrentPageTitle(LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.code);
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
                    <InsertChartIcon sx={{}} />
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
                    <Dashboard sx={{}} />
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
          {String(currentPageTitle).includes("graph") ? (
            <GraphsDrawerList
              setCurrentPageTitle={setCurrentPageTitle}
              currentPageTitle={currentPageTitle}
            />
          ) : String(currentPageTitle).includes("dashboard_layout") ? (
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
