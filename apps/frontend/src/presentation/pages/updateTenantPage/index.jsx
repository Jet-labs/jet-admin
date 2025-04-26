import { useParams } from "react-router-dom";
import { TenantUpdationForm } from "../../components/tenantComponents/tenantUpdationForm";
import React from "react";

const UpdateTenantPage = () => {
  const { tenantID } = useParams();
  return <TenantUpdationForm tenantID={tenantID} />;
};

export default UpdateTenantPage;
