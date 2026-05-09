import React from "react";
import { WidgetAdditionForm } from "../../components/widgetComponents/widgetAdditionForm";
import { useParams } from "react-router-dom";

const AddWidgetPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <WidgetAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddWidgetPage;
