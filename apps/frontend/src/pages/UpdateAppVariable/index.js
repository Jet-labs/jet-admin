import { useParams } from "react-router-dom";
import { AppVariableUpdateForm } from "../../components/AppVariableComponents/AppVariableUpdateForm";
import "./styles.css";
/**
 *
 * @param {object} param0
 * @returns
 */
const UpdateAppVariable = ({}) => {
  const { id } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {id && <AppVariableUpdateForm id={id} />}
    </div>
  );
};

export default UpdateAppVariable;
