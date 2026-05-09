import React from "react";
import { useParams } from "react-router-dom";
import { CronJobUpdationForm } from "../../components/cronJobComponents/cronJobUpdationForm";
const UpdateCronJobPage = () => {
  const { tenantID, cronJobID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-brand-dark">
      <CronJobUpdationForm tenantID={tenantID} cronJobID={cronJobID} />
    </div>
  );
};

export default UpdateCronJobPage;
