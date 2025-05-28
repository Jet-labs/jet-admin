import React from "react";
import { WidgetAdditionForm } from "../../components/widgetComponents/widgetAdditionForm";
import { useParams } from "react-router-dom";

const AddWidgetPage = () => {
  const { tenantID } = useParams();
  return <WidgetAdditionForm tenantID={tenantID} />;
};

export default AddWidgetPage;
