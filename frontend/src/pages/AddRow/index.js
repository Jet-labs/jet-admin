import { useParams } from "react-router-dom";
import "./styles.css";
import { RowAdditionForm } from "../../components/DataGridComponents/RowAdditionForm";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddRow = ({}) => {
  const { table_name } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {table_name && <RowAdditionForm tableName={table_name} />}
    </div>
  );
};

export default AddRow;
