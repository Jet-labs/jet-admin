import { useParams } from "react-router-dom";
import { RawDataGrid } from "../../components/DataGridComponents/RawDataGrid";
import "./styles.css";
import { getSchemaStatisticsAPI } from "../../api/schemas";
import { useQuery } from "@tanstack/react-query";
import { SimpleTableComponent } from "../../components/DataGridComponents/SimpleTableComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { Divider, useTheme } from "@mui/material";
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
      {schemaStatisticsData?.map((result, index) => {
        return (
          result.result_type === "array" && (
            <SimpleTableComponent data={result.result} border={false} />
          )
        );
      })}
    </div>
  );
};

export default DatabaseView;
