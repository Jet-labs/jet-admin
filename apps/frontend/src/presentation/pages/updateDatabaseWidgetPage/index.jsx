import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseWidgetUpdationForm } from "../../components/databaseWidgetComponents/databaseWidgetUpdationForm";

const UpdateDatabaseWidgetPage = () => {
  const { tenantID, databaseWidgetID } = useParams();
  return (
    <DatabaseWidgetUpdationForm
      tenantID={tenantID}
      databaseWidgetID={databaseWidgetID}
    />
  );
};

export default UpdateDatabaseWidgetPage;
