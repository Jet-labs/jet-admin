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
  useAppVariableActions,
  useAppVariables,
} from "../../../contexts/appVariablesContext";
import { useAuthState } from "../../../contexts/authContext";
import { HiMiniVariable } from "react-icons/hi2";
import { VscSymbolVariable } from "react-icons/vsc";

export const AppVariablesDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `app_variable_${routeParam?.["*"]}`;
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const { appVariables } = useAppVariables();
  const { reloadAllAppVariables } = useAppVariableActions();
  const appVariableAddAuthorization = useMemo(() => {
    return pmUser && pmUser.extractAppVariableAddAuthorization();
  }, [pmUser]);

  const _navigateToAddMoreAppVariable = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_APP_VARIABLES.path());
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
          {"App variables"}
        </span>
        <IconButton onClick={reloadAllAppVariables}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {appVariableAddAuthorization && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreAppVariable}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add more constants
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>
      {appVariables && appVariables.length > 0
        ? appVariables.map((appVariable) => {
            const key = `app_variable_${appVariable.pm_app_variable_id}`;
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(
                  appVariable.pm_app_variable_id
                )}
                key={key}
              >
                <ListItem
                  key={`_app_variable_${appVariable.pm_app_variable_id}`}
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
                      <VscSymbolVariable className="!text-lg" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={appVariable.pm_app_variable_title}
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
