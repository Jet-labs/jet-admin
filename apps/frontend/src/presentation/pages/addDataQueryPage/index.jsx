import React from "react";
import { DataQueryAdditionForm } from "../../components/dataQueryComponents/dataQueryAdditionForm";
import { useParams } from "react-router-dom";

const AddDataQueryPage = () => {
  const { tenantID } = useParams();
  return <DataQueryAdditionForm tenantID={tenantID} />;
};

export default AddDataQueryPage;
