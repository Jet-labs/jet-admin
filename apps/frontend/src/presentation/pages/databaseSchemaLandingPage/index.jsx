import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { DefaultDashboardSelectionLayout } from "../../components/ui/defaultDashboardSelectionLayout";

const DatabaseSchemaLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <DefaultDashboardSelectionLayout
      tenantID={tenantID}
      userConfigKey={`${CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID}_${databaseSchemaName}`}
    />
  );
};

export default DatabaseSchemaLandingPage;
