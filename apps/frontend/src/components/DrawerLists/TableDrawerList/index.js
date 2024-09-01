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
import { FaDatabase, FaPlus, FaRedo, FaTable } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { getAllTables } from "../../../api/tables";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "../../../contexts/authContext";
import { useMemo } from "react";
export const TableDrawerList = () => {
  const theme = useTheme();
  const { pmUser } = useAuthState();
  const routeParam = useParams();
  const navigate = useNavigate();
  const currentPage = `table_${routeParam?.["*"]}`;
  const isAuthorizedToAddTable = useMemo(() => {
    return true;
  }, [pmUser]);
  const {
    isLoading: isLoadingTables,
    data: tables,
    error: loadTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLES],
    queryFn: () => getAllTables(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _navigateToAddMoreTable = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_TABLE.path());
  };

  const _navigateToSQLEditor = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.SQL_EDITOR.path());
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
          style={{ color: theme.palette.primary.main }}
          className="!font-semibold"
        >
          {"Tables"}
        </span>
        <IconButton onClick={refetchTables}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddTable && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreTable}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            {LOCAL_CONSTANTS.STRINGS.TABLE_ADD_BUTTON_TEXT}
          </Button>
        </div>
      )}
      <div className="!px-3 !py-1.5 !w-full">
        <Button
          onClick={_navigateToSQLEditor}
          variant="contained"
          className="!w-full"
          startIcon={<FaPlus className="!text-sm" />}
        >
          {LOCAL_CONSTANTS.STRINGS.SQL_EDITOR_NAVIGATE_BUTTON_TEXT}
        </Button>
      </div>
      <div className="!mt-1"></div>
      {tables?.map((table) => {
        const key = `table_${table}`;
        return (
          <Link to={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.path(table)} key={key}>
            <ListItem
              key={key}
              disablePadding
              className="!px-3 !py-1.5"
              sx={{}}
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
                  }}
                >
                  <FaTable className="!text-lg" />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color:
                      key == currentPage
                        ? theme.palette.primary.main
                        : theme.palette.primary.contrastText,
                  }}
                  primary={table}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: key == currentPage ? "700" : "500",
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
