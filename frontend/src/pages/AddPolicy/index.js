import { useParams } from "react-router-dom";
import "./styles.css";
import { RowUpdateForm } from "../../components/RowUpdateForm";
import { RowAdditionForm } from "../../components/RowAdditionForm";
import { LOCAL_CONSTANTS } from "../../constants";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddPolicy = ({}) => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <RowAdditionForm
        tableName={LOCAL_CONSTANTS.STRINGS.POLICY_OBJECT_TABLE_NAME}
      />
    </div>
  );
};

export default AddPolicy;
