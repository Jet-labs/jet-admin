import React from "react";
import { useParams } from "react-router-dom";
import { DatabaseWidgetUpdationForm } from "../../components/databaseWidgetComponents/databaseWidgetUpdationForm";

const UpdateDatabaseWidgetPage = () => {
  const { tenantID, databaseWidgetID } = useParams();
  const uniqueKey = `updateDatabaseWidgetPage_${tenantID}_${databaseWidgetID}`;
  return (
    <DatabaseWidgetUpdationForm
      key={`databaseWidgetUpdationForm_${uniqueKey}`}
      tenantID={tenantID}
      databaseWidgetID={databaseWidgetID}
    />
  );
};

export default UpdateDatabaseWidgetPage;
