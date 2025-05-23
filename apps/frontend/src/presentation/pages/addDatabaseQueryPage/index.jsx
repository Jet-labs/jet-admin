import React from "react";
import { DatabaseQueryAdditionForm } from "../../components/databaseQueryComponents/databaseQueryAdditionForm";
import { useParams } from "react-router-dom";

const AddDatabaseQueryPage = () => {
    const { tenantID } = useParams();
    return <DatabaseQueryAdditionForm tenantID={tenantID} />;
};

export default AddDatabaseQueryPage;
