import React from "react";
import { useParams } from "react-router-dom";
import { DefaultDashboardSelectionLayout } from "../../components/ui/defaultDashboardSelectionLayout";
import { CONSTANTS } from "../../../constants";

const TriggerLayoutLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <DefaultDashboardSelectionLayout
      tenantID={tenantID}
      userConfigKey={`${CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID}_${databaseSchemaName}_triggerLayoutLandingPage`}
    />
  );
};

export default TriggerLayoutLandingPage;
