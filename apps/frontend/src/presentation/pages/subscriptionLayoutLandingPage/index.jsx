import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { DefaultDashboardSelectionLayout } from "../../components/ui/defaultDashboardSelectionLayout";

const SubscriptionLayoutLandingPage = () => {
  const { tenantID } = useParams();

  return (
    <DefaultDashboardSelectionLayout
      tenantID={tenantID}
      userConfigKey={`${CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID}_subscriptionLayoutLandingPage`}
    />
  );
};

export default SubscriptionLayoutLandingPage;
