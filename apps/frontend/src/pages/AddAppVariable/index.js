import { useParams } from "react-router-dom";
import "./styles.css";
import { RowAdditionForm } from "../../components/DataGridComponents/RowAdditionForm";
import { LOCAL_CONSTANTS } from "../../constants";
import { AppVariableAdditionForm } from "../../components/AppVariableComponents/AppVariableAdditionForm";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddAppVariable = () => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <AppVariableAdditionForm />
    </div>
  );
};

export default AddAppVariable;
