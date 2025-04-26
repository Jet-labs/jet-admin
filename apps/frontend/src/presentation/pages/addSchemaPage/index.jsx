import { useParams } from "react-router-dom";
import { DatabaseSchemaAdditionForm } from "../../components/databaseSchemaComponents/databaseSchemaAdditionForm";
import React from "react";


const AddSchemaPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-hidden">
      <DatabaseSchemaAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddSchemaPage;
