import React from "react";
import { DatasourceAdditionForm } from "../../components/datasourceComponents/datasourceAdditionForm";
import { useParams } from "react-router-dom";

const AddDatasourcePage = () => {
    const { tenantID } = useParams();
    return <DatasourceAdditionForm tenantID={parseInt(tenantID)} />;
};

export default AddDatasourcePage;
