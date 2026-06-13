import { Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";
import { useDatasources } from "../../../../logic/hooks/useDatasources";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import { DatasourceIcon } from "../../datasourceComponents/datasourceIcon";

import { Button } from "@jet-admin/ui";

export const DatasourceDrawerList = () => {
  const { tenantID } = useParams();
  const {
    isLoadingDatasources,
    datasources,
    isFetchingDatasources,
  } = useDatasources(tenantID);
  const routeParam = useParams();

  const navigate = useNavigate();

  const _navigateToAddMoreDatasource = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATASOURCE.path(tenantID));
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
        onClick={_navigateToAddMoreDatasource}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="w-4 h-4 mr-2" />
        {CONSTANTS.STRINGS.ADD_DATASOURCE_BUTTON_TEXT}
      </Button>
      </div>

      {isLoadingDatasources || isFetchingDatasources ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
        </div>
      ) : datasources && datasources.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pb-10 space-y-1">
          {datasources.map((datasource) => {
            const key = `datasource_${datasource.datasourceID}`;
            const isActive =
              routeParam?.datasourceID == datasource.datasourceID;
            const datasourceTypeConfig = getDatasourceTypeByValue(datasource.datasourceType);

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATASOURCE_BY_ID.path(
                  tenantID,
                  datasource.datasourceID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <DatasourceIcon
                      icon={datasourceTypeConfig?.icon}
                      iconColor={isActive ? "currentColor" : datasourceTypeConfig?.iconColor}
                      size={16}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {datasource.datasourceTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.DATASOURCE_DRAWER_LIST_NO_DATASOURCE}
          />
        </div>
      )}
    </div>
  );
};
