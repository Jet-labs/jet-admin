import { TableRows } from "@mui/icons-material";
import DataObjectIcon from "@mui/icons-material/DataObject";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../constants";
export const TablesList = ({
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
            // onClick={() => {
            //   setCurrentPageTitle(key);
            // }}
            key={key}
          >
            <ListItem
              key={key}
              disablePadding
              className="!px-3 !py-1.5"
              // sx={{
              //   borderRight: key == currentPageTitle ? 3 : 0,
              //   borderColor: theme.palette.primary.main,
              // }}
            >
              <ListItemButton
                sx={{ background: theme.palette.background.default }}
                selected={key == currentPageTitle}
                className="!rounded"
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
