import React from "react";
import { DatasourceAdditionForm } from "../../components/datasourceComponents/datasourceAdditionForm";
import { useParams } from "react-router-dom";

const AddDatasourcePage = () => {
    const { tenantID } = useParams();

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <DatasourceAdditionForm tenantID={tenantID} />
        </div>
    );
};

export default AddDatasourcePage;
