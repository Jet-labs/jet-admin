import { Grid } from "@mui/material";
import { SimpleTableComponent } from "../SimpleTableComponent";

export const DatabaseStatisticsTableComponent = ({ data }) => {
  return (
    <Grid className="!p-2" xs={12} sm={12} md={6}>
      <SimpleTableComponent data={data} border={true} />
    </Grid>
  );
};
