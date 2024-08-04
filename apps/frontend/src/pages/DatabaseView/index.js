import { useParams } from "react-router-dom";
import { RawDataGrid } from "../../components/DataGridComponents/RawDataGrid";
import "./styles.css";
import { getSchemaStatisticsAPI } from "../../api/schemas";
import { useQuery } from "@tanstack/react-query";
/**
 *
 * @param {object} param0
 * @returns
 */
const DatabaseView = ({}) => {
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
    <div className="flex flex-col justify-center items-center w-full h-full">
      <span>Navigate to tables</span>
    </div>
  );
};

export default DatabaseView;
