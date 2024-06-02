import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { FaDatabase, FaTable } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../../constants";
export const TableDrawerList = ({ authorizedTables, currentPageTitle }) => {
  const theme = useTheme();
  return (
    <List
      sx={{}}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-66px)] !overflow-y-auto !overflow-x-hidden !border-r !border-white !border-opacity-10 w-full"
    >
      <ListItemButton>
        <ListItemText
          primaryTypographyProps={{
            sx: { fontWeight: "600" },
          }}
          primary="Tables"
        />
        {/* {isTableListOpen ? <ExpandLess /> : <ExpandMore />} */}
      </ListItemButton>
      {authorizedTables?.map((table) => {
        const key = `table_${table}`;
        return (
          <Link to={LOCAL_CONSTANTS.ROUTES.TABLE_VIEW.path(table)} key={key}>
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
                  <FaTable sx={{}} />
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
