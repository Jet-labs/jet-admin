import { useParams } from "react-router-dom";

const TriggerLayoutLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <div className="text-slate-500">TriggerLayoutLandingPage</div>
  );
};

export default TriggerLayoutLandingPage;
