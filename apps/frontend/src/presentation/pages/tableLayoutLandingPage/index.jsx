import React from "react";
import { useParams } from "react-router-dom";
import { DefaultDashboardSelectionLayout } from "../../components/ui/defaultDashboardSelectionLayout";
import { CONSTANTS } from "../../../constants";

const TableLayoutLandingPage = () => {
  const { tenantID, databaseSchemaName } = useParams();

  return (
    <DefaultDashboardSelectionLayout
      tenantID={tenantID}
      userConfigKey={`${CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID}_${databaseSchemaName}_tableLayoutLandingPage`}
    />
  );
};

export default TableLayoutLandingPage;
