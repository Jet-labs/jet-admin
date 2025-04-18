import React from "react";
import { useParams } from "react-router-dom";
import { CronJobAdditionForm } from "../../components/cronJobComponents/cronJobAdditionForm";

const AddCronJobPage = () => {
  const { tenantID} = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <CronJobAdditionForm
        tenantID={tenantID}
      />
    </div>
  );
};

export default AddCronJobPage;
