import { Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDataQueries } from "../../../../logic/hooks/useDataQueries";
import { NoEntityUI } from "../../ui/noEntityUI";
import { DatasourceIcon } from "../../datasourceComponents/datasourceIcon";
import { getDatasourceTypeByValue } from "@jet-admin/datasource-types";
import React from "react";

import { Button } from "@jet-admin/ui";

export const DataQueryDrawerList = () => {
  const { tenantID } = useParams();
  const { isLoadingDataQueries, dataQueries, isFetchingDataQueries } = useDataQueries(tenantID);
  const routeParam = useParams();

  const navigate = useNavigate();

  const _navigateToAddMoreQuery = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATA_QUERY.path(tenantID));
  };

  return (
    <div className="bg-background h-full overflow-hidden w-full flex flex-col gap-2">
      <div className="p-2 pb-0">
        <Button
        onClick={_navigateToAddMoreQuery}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="size-4 mr-2" />
        {CONSTANTS.STRINGS.ADD_QUERY_BUTTON_TEXT}
      </Button>
      </div>

      {isLoadingDataQueries || isFetchingDataQueries ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
          <div className="h-9 bg-muted rounded-sm w-full" />
        </div>
      ) : dataQueries && dataQueries.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pb-10 space-y-1">
          {dataQueries.map((dataQuery) => {
            const key = `dataQuery_${dataQuery.dataQueryID}`;
            const isActive = routeParam?.dataQueryID == dataQuery.dataQueryID;
            const datasourceConfig = getDatasourceTypeByValue(dataQuery.datasourceType);

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATA_QUERY_BY_ID.path(
                  tenantID,
                  dataQuery.dataQueryID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="size-4 flex-shrink-0">
                    <DatasourceIcon
                      icon={datasourceConfig?.icon}
                      iconColor={isActive ? "currentColor" : datasourceConfig?.iconColor}
                      size={16}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {dataQuery.dataQueryTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex-1 flex items-center justify-center p-4">
          <NoEntityUI message={CONSTANTS.STRINGS.QUERY_DRAWER_LIST_NO_QUERY} />
        </div>
      )}
    </div>
  );
};
