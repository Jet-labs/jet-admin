import {
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
import { GrConnect } from "react-icons/gr";
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
          to={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
          key={LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path()}
        >
          <ListItem
            disablePadding
            sx={{
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <VscDashboard className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Dashboards"}
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
            sx={{
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <FaDatabase className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Tables"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.path()}
          key={LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.path()}
        >
          <ListItem
            disablePadding
            sx={{
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <GrConnect className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Data sources"}
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
            sx={{
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <FaRegChartBar className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Graphs"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }

      {
        <Link
          to={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT.path()}
          key={LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT.path()}
        >
          <ListItem
            disablePadding
            sx={{
              borderRight: 0,
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <FaUserLock className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                    fontWeight: "500",
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Roles"}
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
            sx={{
              borderColor: theme.palette.primary.main,
            }}
          >
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 0,
                }}
              >
                <FaRegUser className="!text-sm" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    marginLeft: 2,
                    fontSize: 12,
                  },
                }}
                sx={{
                  color: theme.palette.primary.contrastText,
                }}
                primary={"Accounts"}
              />
            </ListItemButton>
          </ListItem>
        </Link>
      }
    </List>
  );
};
