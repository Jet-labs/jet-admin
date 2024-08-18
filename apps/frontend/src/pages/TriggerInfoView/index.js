import { useParams } from "react-router-dom";
import TriggerViewComponent from "../../components/TriggerComponents/TriggerViewComponent";

const TriggerInfoView = () => {
  const { id } = useParams();
  return <TriggerViewComponent id={id} />;
};

export default TriggerInfoView;
