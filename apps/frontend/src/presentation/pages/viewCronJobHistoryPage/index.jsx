import React from "react";
import { useParams } from "react-router-dom";
import { CronJobHistoryGrid } from "../../components/cronJobComponents/cronJobHistoryGrid";

const ViewCronJobHistoryPage = () => {
  const { tenantID, cronJobID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <CronJobHistoryGrid tenantID={tenantID} cronJobID={cronJobID} />
    </div>
  );
};

export default ViewCronJobHistoryPage;
