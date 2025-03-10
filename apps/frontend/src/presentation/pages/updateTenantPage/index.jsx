import { useParams } from "react-router-dom";
import { TenantUpdationForm } from "../../components/ui/tenantUpdationForm";
const UpdateTenantPage = () => {
  const { tenantID } = useParams();
  return <TenantUpdationForm tenantID={tenantID} />;
};

export default UpdateTenantPage;
