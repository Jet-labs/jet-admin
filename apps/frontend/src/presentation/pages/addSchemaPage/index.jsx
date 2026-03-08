import { useParams } from "react-router-dom";
import { DatabaseSchemaAdditionForm } from "../../components/databaseSchemaComponents/databaseSchemaAdditionForm";
import React from "react";


const AddSchemaPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background p-4 md:p-8">
      <DatabaseSchemaAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddSchemaPage;
