import React from "react";
import { useParams } from "react-router-dom";
import { WebhookAdditionForm } from "../../components/webhookComponents/webhookAdditionForm";

const AddWebhookPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background">
      <WebhookAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddWebhookPage;
