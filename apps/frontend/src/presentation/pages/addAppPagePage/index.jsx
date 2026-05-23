import React from "react";
import { DashboardAdditionForm } from "../../components/dashboardComponents/dashboardAdditionForm";
import { useParams } from "react-router-dom";

/**
 * AddAppPagePage
 *
 * Reuses the existing DashboardAdditionForm for now.
 * Will be replaced with a dedicated AppPage creation form
 * when Task 5 (component rename) is completed.
 */
const AddAppPagePage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DashboardAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddAppPagePage;
