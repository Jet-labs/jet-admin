import { useParams } from "react-router-dom";
import { AppConstantUpdateForm } from "../../components/AppConstantComponents/AppConstantUpdateForm";
import "./styles.css";
/**
 *
 * @param {object} param0
 * @returns
 */
const UpdateAppConstant = ({}) => {
  const { id } = useParams();
  return (
    <div className="flex flex-col justify-start items-stretch w-full h-full">
      {id && <AppConstantUpdateForm id={id} />}
    </div>
  );
};

export default UpdateAppConstant;
