import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FaChalkboardTeacher, FaPlus, FaRedo } from "react-icons/fa";
import { LOCAL_CONSTANTS } from "../../../constants";
import {
  useAppConstantActions,
  useAppConstants,
} from "../../../contexts/appConstantsContext";
import { useAuthState } from "../../../contexts/authContext";

export const AppConstantsList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `app_constant_${routeParam?.["*"]}`;
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const { appConstants } = useAppConstants();
  const { reloadAllAppConstants } = useAppConstantActions();
  const isAuthorizedToAddAppConstant = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddAppConstant();
  }, [pmUser]);

  console.log({ appConstants });
  const _navigateToAddMoreAppConstant = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.APP_CONSTANT_VIEW.path());
  };

  return (
    <List
      style={{
        borderRightWidth: 1,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.default,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full"
    >
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span
          className="!font-semibold"
          style={{ color: theme.palette.primary.main }}
        >
          {"App constants"}
        </span>
        <IconButton onClick={reloadAllAppConstants}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddAppConstant && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreAppConstant}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add more constants
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>
      {appConstants && appConstants.length > 0
        ? appConstants.map((appConstant) => {
            const key = `app_constant_${appConstant.pm_app_constant_id}`;
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(
                  appConstant.pm_app_constant_id
                )}
                key={key}
              >
                <ListItem
                  key={`_app_constant_${appConstant.pm_app_constant_id}`}
                  disablePadding
                  className="!px-3 !py-1.5"
                >
                  <ListItemButton
                    sx={{
                      background: theme.palette.background.paper,
                      border: key == currentPage ? 1 : 0,
                      borderColor: theme.palette.primary.main,
                    }}
                    selected={key == currentPage}
                    className="!rounded"
                  >
                    <ListItemIcon
                      className="!ml-1"
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                        minWidth: 0,
                      }}
                    >
                      <FaChalkboardTeacher className="!text-sm" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={appConstant.pm_app_constant_title}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: key == currentPage ? "700" : "500",
                          fontSize: 12,
                          marginLeft: 2,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {/* <Divider className="!mx-4" /> */}
              </Link>
            );
          })
        : null}
    </List>
  );
};
