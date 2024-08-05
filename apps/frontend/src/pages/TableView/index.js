import { useParams } from "react-router-dom";
import { RawDataGrid } from "../../components/DataGridComponents/RawDataGrid";
import "./styles.css";
import { TableDataGrid } from "../../components/DataGridComponents/TableDataGrid";
/**
 *
 * @param {object} param0
 * @returns
 */
const TableView = ({}) => {
  const { table_name } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {table_name && <TableDataGrid showStats={true} tableName={table_name} />}
    </div>
  );
};

export default TableView;
