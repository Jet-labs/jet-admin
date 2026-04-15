import React from "react";
import { useParams } from "react-router-dom";
import { WebhookUpdationForm } from "../../components/webhookComponents/webhookUpdationForm";

const UpdateWebhookPage = () => {
  const { tenantID, webhookID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-background">
      <WebhookUpdationForm tenantID={tenantID} webhookID={webhookID} />
    </div>
  );
};

export default UpdateWebhookPage;
