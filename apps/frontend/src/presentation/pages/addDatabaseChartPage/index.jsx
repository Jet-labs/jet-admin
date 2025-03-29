import React from "react";
import { DatabaseChartAdditionForm } from "../../components/databaseChartComponents/databaseChartAdditionForm";
import { useParams } from "react-router-dom";



const AddDatabaseChartPage = () => {
    const { tenantID } = useParams();
    return <DatabaseChartAdditionForm tenantID={tenantID} />;
};

export default AddDatabaseChartPage;
