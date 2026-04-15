import React from "react";
import { useParams } from "react-router-dom";
import { SubscriptionUpdationForm } from "../../components/subscriptionComponents/subscriptionUpdationForm";

const UpdateSubscriptionPage = () => {
  const { tenantID, subscriptionID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background">
      <SubscriptionUpdationForm
        tenantID={tenantID}
        subscriptionID={subscriptionID}
      />
    </div>
  );
};

export default UpdateSubscriptionPage;
