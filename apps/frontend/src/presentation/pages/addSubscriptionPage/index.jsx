import React from "react";
import { useParams } from "react-router-dom";
import { SubscriptionAdditionForm } from "../../components/subscriptionComponents/subscriptionAdditionForm";

const AddSubscriptionPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background">
      <SubscriptionAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddSubscriptionPage;
