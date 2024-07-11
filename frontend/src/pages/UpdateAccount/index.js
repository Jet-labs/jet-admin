import { useParams } from "react-router-dom";
import { UpdateAccountForm } from "../../components/AccountComponents/UpdateAccountForm";

const UpdateAccount = () => {
  const { id } = useParams();
  return <UpdateAccountForm id={id} />;
};

export default UpdateAccount;
