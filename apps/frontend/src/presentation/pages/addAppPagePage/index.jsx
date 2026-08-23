import React from "react";
import { AppPageAdditionForm } from "../../components/appPageComponents/forms/appPageAdditionForm";
import { useParams } from "react-router-dom";

const AddAppPagePage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <AppPageAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddAppPagePage;
