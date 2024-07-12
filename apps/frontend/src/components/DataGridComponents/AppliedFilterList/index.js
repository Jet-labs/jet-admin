import { Chip, Grid, ListItem, useTheme } from "@mui/material";
import React from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

export const AppliedFiltersList = ({ filters, handleDeleteFilter }) => {
  const theme = useTheme();
  return filters && filters.length > 0 ? (
    <Grid
      item
      xs={12}
      className="!flex !flex-row !justify-start  !w-full !flex-wrap !mt-3"
      gap={1}
    >
      {filters?.map((filter, index) => {
        return (
          <ListItem key={index} className="!max-w-max !p-0 ">
            <Chip
              label={`${filter.field} ${filter.operator} ${filter.value}`}
              onDelete={() => {
                handleDeleteFilter(index);
              }}
              deleteIcon={
                <FaTimes
                  className="!text-sm"
                  style={{ color: theme.palette.primary.contrastText }}
                />
              }
              variant="outlined"
              className="!rounded"
              style={{
                background: theme.palette.background.paper,
                borderWidth: 0,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.main,
              }}
            />
          </ListItem>
        );
      })}
    </Grid>
  ) : null;
};
