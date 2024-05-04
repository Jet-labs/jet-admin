import { useParams } from "react-router-dom";
import "./styles.css";
import { RowUpdateForm } from "../../components/RowUpdateForm";
/**
 *
 * @param {object} param0
 * @returns
 */
const RowView = ({}) => {
  const { table_name, id } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {table_name && id && <RowUpdateForm tableName={table_name} id={id} />}
    </div>
  );
};

export default RowView;
