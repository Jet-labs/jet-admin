import { useParams } from "react-router-dom";
import { AccountUpdationForm } from "../../components/AccountComponents/AccountUpdationForm";

const UpdateAccount = () => {
  const { id } = useParams();
  return <AccountUpdationForm id={id} />;
};

export default UpdateAccount;
