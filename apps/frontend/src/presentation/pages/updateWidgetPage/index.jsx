import React from "react";
import { useParams } from "react-router-dom";
import { WidgetUpdationForm } from "../../components/widgetComponents/widgetUpdationForm";

const UpdateWidgetPage = () => {
  const { tenantID, widgetID } = useParams();
  const uniqueKey = `updateWidgetPage_${tenantID}_${widgetID}`;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <WidgetUpdationForm
        key={`widgetUpdationForm_${uniqueKey}`}
        tenantID={tenantID}
        widgetID={widgetID}
      />
    </div>
  );
};

export default UpdateWidgetPage;
