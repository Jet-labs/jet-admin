import { FaPlus } from "react-icons/fa";
import { LuDatabaseZap } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDatabaseTriggersState } from "../../../../logic/contexts/databaseTriggersContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";

import { Button } from "@jet-admin/ui";

export const DatabaseTriggerDrawerList = () => {
  const {
    isLoadingDatabaseTriggers,
    databaseTriggers,
    isFetchingDatabaseTriggers,
  } = useDatabaseTriggersState();
  const routeParam = useParams();
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreTrigger = () => {
    navigate(
      CONSTANTS.ROUTES.ADD_DATABASE_TRIGGER.path(tenantID, databaseSchemaName)
    );
  };
  return (
    <div className="bg-background h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <Button
        onClick={_navigateToAddMoreTrigger}
        variant="primary-ghost"
        className="w-full mb-2"
      >
        <FaPlus className="w-4 h-4 mr-2" />
        {CONSTANTS.STRINGS.ADD_TRIGGER_BUTTON_TEXT}
      </Button>

      {/* Trigger List */}

      {isLoadingDatabaseTriggers || isFetchingDatabaseTriggers ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="h-8 bg-muted rounded w-full"></div>
        </div>
      ) : databaseTriggers && databaseTriggers.length > 0 ? (
          <div className="h-full w-full overflow-y-auto pb-10">
          {databaseTriggers.map((databaseTrigger) => {
            const key = `databaseTrigger_${databaseTrigger.databaseTriggerName}_${databaseTrigger.databaseTableName}`;
            const isActive =
              routeParam?.databaseTriggerName ==
                databaseTrigger.databaseTriggerName &&
              routeParam?.databaseTableName ==
                databaseTrigger.databaseTableName;

            return (
              <Link
                to={CONSTANTS.ROUTES.VIEW_DATABASE_TRIGGER_BY_NAME.path(
                  tenantID,
                  databaseSchemaName,
                  databaseTrigger.databaseTableName,
                  databaseTrigger.databaseTriggerName
                )}
                key={key}
                className="block mb-1 focus:outline-none"
              >
                <div
                  className={`flex items-center px-2 py-1.5 rounded-md transition-colors ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <LuDatabaseZap
                    className={`w-4 h-4 mr-2 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                  />

                  <span
                    className={`text-sm truncate ${isActive ? "font-medium" : ""
                    } `}
                  >
                    {`${databaseTrigger.databaseTableName}.${databaseTrigger.databaseTriggerName}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="text-muted-foreground mt-4">
          <NoEntityUI
            message={CONSTANTS.STRINGS.TRIGGER_DRAWER_LIST_NO_TRIGGER}
          />
        </div>
      )}
    </div>
  );
};
