import React from "react";
import { DatasourceAdditionForm } from "../../components/datasourceComponents/datasourceAdditionForm";
import { useParams } from "react-router-dom";

const AddDatasourcePage = () => {
    const { tenantID } = useParams();
    return <DatasourceAdditionForm tenantID={tenantID} />;
};

export default AddDatasourcePage;
