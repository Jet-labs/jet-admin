import { Circle, ExpandLess, ExpandMore, PeopleAlt, TableRows } from "@mui/icons-material";
import PolicyIcon from "@mui/icons-material/Policy";
import {
  Collapse,
  Divider,
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
export const DrawerList = ({
  setIsDrawerOpen,
  currentPageTitle,
  setCurrentPageTitle,
}) => {
  const [isTableListOpen, setIsTableListOpen] = useState(false);
  const [isActionListOpen, setIsActionListOpen] = useState(false);
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

  const authorizedActions = useMemo(() => {
    if (pmUser) {
      const c = pmUser.extractAuthorizedActionEntities();
      return c;
    } else {
      return null;
    }
  }, [pmUser]);

  const _handleToggleIsTableListOpen = () => {
    setIsTableListOpen(!isTableListOpen);
  };
  const _handleToggleIsActionListOpen = () => {
    setIsActionListOpen(!isActionListOpen);
  };

  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <ListItemButton onClick={_handleToggleIsTableListOpen}>
        <ListItemIcon>
          <TableRows sx={{}} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            sx: { marginLeft: -2 },
          }}
          primary="Tables"
        />
        {isTableListOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={isTableListOpen} timeout="auto" unmountOnExit>
        {authorizedTables?.map((key) => {
          return (
            <Link
              to={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.path(key)}
              onClick={() => {
                setIsDrawerOpen(false);
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
                    <Circle sx={{ fontSize: 10 }} />
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
      </Collapse>
      {/* <ListItemButton onClick={_handleToggleIsActionListOpen}>
        <ListItemIcon>
          <TouchAppIcon sx={{}} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            sx: { marginLeft: -2 },
          }}
          primary="Actions"
        />
        {isActionListOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton> */}
      {/* <Collapse in={isActionListOpen} timeout="auto" unmountOnExit>
        {authorizedActions &&
          Object.keys(authorizedActions).map((entity) => {
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.ACTIONS.path(entity)}
                onClick={() => {
                  setIsDrawerOpen(false);
                  setCurrentPageTitle(`${entity} - actions`);
                }}
                key={entity}
              >
                <ListItem key={entity} disablePadding>
                  <ListItemButton
                    sx={{ background: theme.palette.background.default }}
                  >
                    <ListItemIcon
                      className="!ml-1"
                      sx={{
                        color:
                          entity == currentPageTitle
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                    >
                      <Circle sx={{ fontSize: 10 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={entity.charAt(0).toUpperCase() + entity.slice(1)}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight:
                            entity == currentPageTitle ? "700" : "500",
                          marginLeft: -2,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          })}
      </Collapse> */}

      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT}
          key={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT}
        >
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PolicyIcon sx={{}} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: { marginLeft: -2 },
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
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <PeopleAlt sx={{}} />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: { marginLeft: -2 },
                }}
                primary={"Accounts Management"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
    </List>
  );
};
