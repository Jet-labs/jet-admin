import React from "react";
import { useParams } from "react-router-dom";
import { CronJobUpdationForm } from "../../components/cronJobComponents/cronJobUpdationForm";



const UpdateCronJobPage = () => {
    const { tenantID,cronJobID } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <CronJobUpdationForm
        tenantID={tenantID}
        cronJobID={cronJobID}
      />
    </div>
  );
};

export default UpdateCronJobPage;
