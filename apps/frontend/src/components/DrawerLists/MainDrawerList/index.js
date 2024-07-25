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
import { Link, useLocation, useParams } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { GrConnect } from "react-icons/gr";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { VscSymbolVariable } from "react-icons/vsc";
const drawerList = [
  {
    text: "Dashboards",
    icon: <VscDashboard size={32} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ALL_DASHBOARD_LAYOUTS.path(),
  },
  {
    text: "Tables",
    icon: <FaDatabase size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ALL_TABLES.path(),
  },
  {
    text: "Queries",
    icon: <GrConnect size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ALL_QUERIES.path(),
  },
  {
    text: "Jobs",
    icon: <RiCalendarScheduleFill size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ALL_JOBS.path(),
  },
  {
    text: "Graphs",
    icon: <FaRegChartBar size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ALL_GRAPHS.path(),
  },
  {
    text: "Constants",
    icon: <VscSymbolVariable size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT,
  },
  {
    text: "Policies",
    icon: <FaUserLock size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.POLICY_MANAGEMENT.path(),
  },
  {
    text: "Accounts",
    icon: <FaRegUser size={24} className="!text-sm" />,
    to: LOCAL_CONSTANTS.ROUTES.ACCOUNT_MANAGEMENT,
  },
];
export const MainDrawerList = ({ currentPageTitle }) => {
  const theme = useTheme();
  const location = useLocation();
  // console.log({ routeParam });

  return (
    <List
      style={{
        borderRightWidth: 1,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.default,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className="!py-0 !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full"
    >
      {drawerList.map((item) => {
        let isCurrentPage = location.pathname.includes(item.to);
        return (
          <Link to={item.to} key={item.to}>
            <ListItem disablePadding className="!px-3 !py-1">
              <ListItemButton
                sx={{
                  borderColor: theme.palette.primary.main,
                  backgroundColor: isCurrentPage
                    ? theme.palette.background.paper
                    : theme.palette.background.default,
                }}
                className="!rounded !flex !flex-col !justify-center !items-center"
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  className="!flex !flex-col !justify-center !items-center"
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      fontSize: 10,
                      fontWeight: "600",
                    },
                  }}
                  sx={{
                    color: theme.palette.primary.contrastText,
                  }}
                  style={{
                    margin: 0,
                    marginTop: 4,
                  }}
                  primary={item.text}
                />
              </ListItemButton>
            </ListItem>
          </Link>
        );
      })}
    </List>
  );
};
