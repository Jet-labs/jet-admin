import { AccountAdditionForm } from "../../components/AccountComponents/AccountAdditionForm";
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
      <AccountAdditionForm />
    </div>
  );
};

export default AddAccount;
