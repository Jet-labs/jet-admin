import { useParams } from "react-router-dom";
import "./styles.css";
import { RowAdditionForm } from "../../components/DataGridComponents/RowAdditionForm";
import { LOCAL_CONSTANTS } from "../../constants";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddAppConstant = () => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <RowAdditionForm
        tableName={LOCAL_CONSTANTS.STRINGS.APP_CONSTANTS_TABLE_NAME}
        customTitle={`Add app constant`}
      />
    </div>
  );
};

export default AddAppConstant;
