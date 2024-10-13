import { TableAdditionForm } from "../../components/TableSchemaComponents/TableAdditionForm";
import "./styles.css";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddTable = ({}) => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <TableAdditionForm />
    </div>
  );
};

export default AddTable;
