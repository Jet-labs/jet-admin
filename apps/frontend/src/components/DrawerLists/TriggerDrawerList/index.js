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
import { useAuthState } from "../../../contexts/authContext";
import { HiMiniVariable } from "react-icons/hi2";
import { VscSymbolVariable } from "react-icons/vsc";
import { getAllTriggerAPI } from "../../../api/triggers";
import { useQuery } from "@tanstack/react-query";
import { GrTrigger } from "react-icons/gr";
export const TriggersDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `${routeParam?.["*"]}`;
  const { pmUser } = useAuthState();
  const navigate = useNavigate();

  const isAuthorizedToAddTrigger = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddTrigger();
  }, [pmUser]);

  const {
    isLoading: isLoadingTriggers,
    data: triggers,
    error: loadTriggersError,
    refetch: refetchTriggers,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TRIGGERS],
    queryFn: () => getAllTriggerAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _navigateToAddMoreTrigger = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_APP_CONSTANT.path());
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
          {"Triggers"}
        </span>
        <IconButton onClick={refetchTriggers}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddTrigger && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreTrigger}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            {LOCAL_CONSTANTS.STRINGS.TRIGGER_ADDITION_PAGE_TITLE}
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>
      {triggers && triggers.length > 0
        ? triggers.map((trigger) => {
            const key = `${trigger.pm_trigger_table_name}-${trigger.pm_trigger_name}`;
            return (
              <Link to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(key)} key={key}>
                <ListItem disablePadding className="!px-3 !py-1.5">
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
                      <GrTrigger className="!text-lg" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={key}
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
