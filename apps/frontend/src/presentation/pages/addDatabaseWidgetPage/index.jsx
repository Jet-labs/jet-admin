import React from "react";
import { DatabaseWidgetAdditionForm } from "../../components/databaseWidgetComponents/databaseWidgetAdditionForm";
import { useParams } from "react-router-dom";



const AddDatabaseWidgetPage = () => {
    const { tenantID } = useParams();
  return <DatabaseWidgetAdditionForm tenantID={tenantID}  />;
};

export default AddDatabaseWidgetPage;
