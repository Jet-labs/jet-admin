import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../logic/contexts/authContext";
import { DatabaseDashboardViewer } from "../../components/databaseDashboardComponents/databaseDashboardViewer";

const ViewDatabaseDashboardPage = () => {
  const { tenantID } = useParams();
  const {userConfig} = useAuthState();
  
  return parseInt(
    userConfig?.[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID]
  ) ? (
    <DatabaseDashboardViewer
      tenantID={tenantID}
      databaseDashboardID={parseInt(
        userConfig?.[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID]
      )}
    />
  ) : (
    <div className="text-slate-700">{"No pinned dashboard"}</div>
  );
  
};

export default ViewDatabaseDashboardPage;
