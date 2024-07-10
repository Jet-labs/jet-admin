import { RowAdditionForm } from "../../components/DataGridComponents/RowAdditionForm";
import { LOCAL_CONSTANTS } from "../../constants";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddAccount = ({}) => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <RowAdditionForm tableName={LOCAL_CONSTANTS.STRINGS.PM_USER_TABLE_NAME} />
    </div>
  );
};

export default AddAccount;
