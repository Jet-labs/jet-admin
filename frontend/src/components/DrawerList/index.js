import { Circle, ExpandLess, ExpandMore, PeopleAlt, TableRows } from "@mui/icons-material";
import PolicyIcon from "@mui/icons-material/Policy";
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
      {authorizedTables?.map((key) => {
        return (
          <Link
            to={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.path(key)}
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
                  primary={key}
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
  console.log({ currentPageTitle });

  const authorizedTables = useMemo(() => {
    if (pmUser) {
      const c = pmUser.extractAuthorizedTables();
      return c;
    } else {
      return null;
    }
  }, [pmUser]);

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
        </List>
      </Grid>
      {
        <Grid item xs={6} md={6} lg={7}>
          <TableList
            authorizedTables={authorizedTables}
            setCurrentPageTitle={setCurrentPageTitle}
            currentPageTitle={currentPageTitle}
          />
        </Grid>
      }
    </Grid>
  );
};
