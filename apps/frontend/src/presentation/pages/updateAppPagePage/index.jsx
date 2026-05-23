import React from "react";
import { useParams } from "react-router-dom";
import { DashboardUpdationForm } from "../../components/dashboardComponents/dashboardUpdationForm";

/**
 * UpdateAppPagePage
 *
 * Reuses the existing DashboardUpdationForm for now.
 * Will be replaced with a dedicated AppPage editor
 * when Task 5 (component rename) is completed.
 */
const UpdateAppPagePage = () => {
  const { tenantID, appPageID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DashboardUpdationForm tenantID={tenantID} dashboardID={appPageID} />
    </div>
  );
};

export default UpdateAppPagePage;
