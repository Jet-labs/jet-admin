import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { DefaultAppPageSelectionLayout } from "../../components/ui/defaultAppPageSelectionLayout";

const WorkflowLayoutLandingPage = () => {
  const { tenantID } = useParams();

  return (
    <DefaultAppPageSelectionLayout
      tenantID={tenantID}
      userConfigKey={`${CONSTANTS.USER_CONFIG_KEYS.DEFAULT_APP_PAGE_ID}_workflowLayoutLandingPage`}
    />
  );
};

export default WorkflowLayoutLandingPage;
