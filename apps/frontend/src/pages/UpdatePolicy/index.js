import { useParams } from "react-router-dom";
import { PolicyUpdateForm } from "../../components/PolicyComponents/PolicyUpdateForm";

const UpdatePolicy = () => {
  const { id } = useParams();
  return <PolicyUpdateForm id={id} />;
};

export default UpdatePolicy;
