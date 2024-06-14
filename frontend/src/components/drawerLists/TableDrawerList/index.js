import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { FaDatabase, FaRedo, FaTable } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
import { getAllTables } from "../../../api/tables";
import { useQuery } from "@tanstack/react-query";
export const TableDrawerList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `table_${routeParam?.["*"]}`;

  const {
    isLoading: isLoadingTables,
    data: tables,
    error: loadTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_TABLES`],
    queryFn: () => getAllTables(),
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
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span className="!font-semibold">{"Tables"}</span>
        <IconButton onClick={refetchTables}>
          <FaRedo className="!text-sm" />
        </IconButton>
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
                  background: theme.palette.background.default,
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
                  <FaTable sx={{}} />
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
