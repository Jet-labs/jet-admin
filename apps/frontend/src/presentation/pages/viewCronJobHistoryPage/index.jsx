import React from "react";
import { useParams } from "react-router-dom";
import { CronJobHistoryGrid } from "../../components/cronJobComponents/cronJobHistoryGrid";

const ViewCronJobHistoryPage = () => {
    const { tenantID,cronJobID } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <CronJobHistoryGrid
        tenantID={tenantID}
        cronJobID={cronJobID}
      />
    </div>
  );
};

export default ViewCronJobHistoryPage;
