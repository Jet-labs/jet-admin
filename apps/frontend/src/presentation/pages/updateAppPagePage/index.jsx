import React from "react";
import { useParams } from "react-router-dom";
import { AppPageUpdationForm } from "../../components/appPageComponents/forms/appPageUpdationForm";

const UpdateAppPagePage = () => {
  const { tenantID, appPageID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <AppPageUpdationForm key={appPageID} tenantID={tenantID} appPageID={appPageID} />
    </div>
  );
};

export default UpdateAppPagePage;
