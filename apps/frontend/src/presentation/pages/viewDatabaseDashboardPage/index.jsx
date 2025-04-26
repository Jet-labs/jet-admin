import React from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../logic/contexts/authContext";
import { DatabaseDashboardViewer } from "../../components/databaseDashboardComponents/databaseDashboardViewer";

const ViewDatabaseDashboardPage = () => {
  const { tenantID } = useParams();
  const { userConfig } = useAuthState();

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
    <div className="h-full w-full flex justify-center items-center p-6">
      <div className="bg-white p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#646cff]/10 p-4 rounded-full">
            <MdOutlineSpaceDashboard className="text-[#646cff] text-4xl" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">
          {CONSTANTS.STRINGS.DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_TITLE}
        </h2>
        <p className="text-slate-600 mb-6">
          {CONSTANTS.STRINGS.DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_DESCRIPTION}
        </p>
      </div>
    </div>
  );
};

export default ViewDatabaseDashboardPage;
