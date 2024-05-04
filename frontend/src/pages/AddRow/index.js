import { useParams } from "react-router-dom";
import "./styles.css";
import { RowUpdateForm } from "../../components/RowUpdateForm";
import { RowAdditionForm } from "../../components/RowAdditionForm";
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
