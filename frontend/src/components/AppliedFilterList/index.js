import { Chip, Grid, ListItem } from "@mui/material";
import React from "react";

export const AppliedFiltersList = ({ filters, handleDeleteFilter }) => {
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
              variant="outlined"
              className="!rounded-md !bg-[#373078] !border-[#7b79ff]"
            />
          </ListItem>
        );
      })}
    </Grid>
  ) : null;
};
