import { Divider, Grid, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getSchemaStatisticsAPI } from "../../api/schemas";

import "./styles.css";
import { TableWidgetComponent } from "../../components/Widgets/TableWidgetComponent";
import { capitalize } from "@rigu/js-toolkit";
/**
 *
 * @param {object} param0
 * @returns
 */
const DatabaseView = ({}) => {
  const theme = useTheme();
  // const { table_name } = useParams();
  const {
    isLoading: isLoadingSchemaStatistics,
    data: schemaStatisticsData,
    error: loadSchemaStatisticsError,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_DATABASE_STATISTICS`],
    queryFn: () => getSchemaStatisticsAPI(),
    cacheTime: 0,
    retry: 1,
  });

  return (
    <div className="flex flex-col justify-start items-center w-full h-full">
      <div className="flex flex-row items-center justify-start w-full p-2">
        <span className="text-lg font-bold text-start ">
          {`Database statistics`}
        </span>
      </div>
      <Divider className="!w-full" />
      <Grid container className="!w-full !overflow-y-scroll">
        {schemaStatisticsData?.map((result, index) => {
          return (
            result.result_type === "array" && (
              <Grid xs={12} sm={12} md={6} className="!p-2">
                <TableWidgetComponent
                  title={String(result.name)
                    .split("_")
                    .map((v, _) => capitalize(v))
                    .join(" ")}
                  data={result.result}
                />
              </Grid>
            )
          );
        })}
      </Grid>
    </div>
  );
};

export default DatabaseView;
