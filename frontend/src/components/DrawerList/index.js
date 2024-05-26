import { Circle, ExpandLess, ExpandMore, PeopleAlt, TableRows } from "@mui/icons-material";
import PolicyIcon from "@mui/icons-material/Policy";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import {
  Collapse,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { useConstants } from "../../contexts/constantsContext";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import StorageIcon from "@mui/icons-material/Storage";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { useQuery } from "@tanstack/react-query";
import { getAllGraphAPI } from "../../api/graphs";
const TableList = ({
  authorizedTables,
  setCurrentPageTitle,
  currentPageTitle,
}) => {
  const theme = useTheme();
  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <ListItemButton>
        <ListItemIcon>
          <TableRows sx={{}} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            sx: { marginLeft: -2 },
          }}
          primary="Tables"
        />
        {/* {isTableListOpen ? <ExpandLess /> : <ExpandMore />} */}
      </ListItemButton>
      {authorizedTables?.map((table) => {
        const key = `table_${table}`;
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.path(table)}
            onClick={() => {
              setCurrentPageTitle(key);
            }}
            key={key}
          >
            <ListItem
              key={key}
              disablePadding
              sx={{
                borderRight: key == currentPageTitle ? 3 : 0,
                borderColor: theme.palette.primary.main,
              }}
            >
              <ListItemButton
                sx={{ background: theme.palette.background.default }}
                selected={key == currentPageTitle}
              >
                <ListItemIcon
                  className="!ml-1"
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                >
                  <DataObjectIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={table}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: key == currentPageTitle ? "700" : "500",
                      marginLeft: -2,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {/* <Divider className="!mx-4" /> */}
          </Link>
        );
      })}
    </List>
  );
};

const GraphsList = ({ setCurrentPageTitle, currentPageTitle }) => {
  const theme = useTheme();
  const {
    isLoading: isLoadingGraphs,
    data: graphs,
    error: loadGraphsError,
    refetch: refetchGraphs,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_GRAPH`],
    queryFn: () => getAllGraphAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: Infinity,
  });
  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <ListItemButton>
        <ListItemIcon>
          <TableRows sx={{}} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            sx: { marginLeft: -2 },
          }}
          primary="Graphs"
        />
      </ListItemButton>
      {graphs?.map((graph) => {
        const key = `graph_${graph.pm_graph_id}`;
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(graph.pm_graph_id)}
            onClick={() => {
              setCurrentPageTitle(key);
            }}
            key={key}
          >
            <ListItem
              key={`_graph_${graph.pm_graph_id}`}
              disablePadding
              sx={{
                borderRight: key == currentPageTitle ? 3 : 0,
                borderColor: theme.palette.primary.main,
              }}
            >
              <ListItemButton
                sx={{ background: theme.palette.background.default }}
                selected={key == currentPageTitle}
              >
                <ListItemIcon
                  className="!ml-1"
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                >
                  <DataObjectIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPageTitle
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={graph.title}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: key == currentPageTitle ? "700" : "500",
                      marginLeft: -2,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {/* <Divider className="!mx-4" /> */}
          </Link>
        );
      })}
    </List>
  );
};
export const DrawerList = ({ currentPageTitle, setCurrentPageTitle }) => {
  // const [isTableListOpen, setIsTableListOpen] = useState(true);
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

  console.log({ currentPageTitle, r: currentPageTitle?.includes("graph") });

  return (
    <Grid container className="!w-full">
      <Grid item xs={6} md={6} lg={5}>
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
              to={LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code}
              key={LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code}
              onClick={() => {
                setCurrentPageTitle(LOCAL_CONSTANTS.ROUTES.ALL_TABLES.code);
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
                    <InsertChartIcon sx={{}} />
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
        </List>
      </Grid>
      {
        <Grid item xs={6} md={6} lg={7}>
          {String(currentPageTitle).includes("graph") ? (
            <GraphsList
              setCurrentPageTitle={setCurrentPageTitle}
              currentPageTitle={currentPageTitle}
            />
          ) : (
            <TableList
              authorizedTables={authorizedTables}
              setCurrentPageTitle={setCurrentPageTitle}
              currentPageTitle={currentPageTitle}
            />
          )}
        </Grid>
      }
    </Grid>
  );
};
