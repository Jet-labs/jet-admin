import { useParams } from "react-router-dom";
import "./styles.css";
import { RowAdditionForm } from "../../components/DataGridComponents/RowAdditionForm";
import { LOCAL_CONSTANTS } from "../../constants";
import { AppConstantAdditionForm } from "../../components/AppConstantComponents/AppConstantAdditionForm";
/**
 *
 * @param {object} param0
 * @returns
 */
const AddAppConstant = () => {
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      <AppConstantAdditionForm />
    </div>
  );
};

export default AddAppConstant;
