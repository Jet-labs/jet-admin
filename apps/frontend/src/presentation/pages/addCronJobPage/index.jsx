import React from "react";
import { useParams } from "react-router-dom";
import { CronJobAdditionForm } from "../../components/cronJobComponents/cronJobAdditionForm";

const AddCronJobPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-brand-dark">
      <CronJobAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddCronJobPage;
