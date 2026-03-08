import { FaPlus, FaTable } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDatabaseTablesState } from "../../../../logic/contexts/databaseTablesContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";

import { Button } from "@jet-admin/ui";
export const DatabaseTableDrawerList = () => {
  const { isLoadingDatabaseTables, isFetchingDatabaseTables, databaseTables } =
    useDatabaseTablesState();
  const routeParam = useParams();
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreTable = () => {
    navigate(
      CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(tenantID, databaseSchemaName)
    );
  };

  return (
    <div className="bg-background h-full overflow-hidden p-2 w-full flex flex-col items-stretch">
      <Button
        onClick={_navigateToAddMoreTable}
        variant="primary-ghost" className="w-full mb-2"
      >
        <FaPlus className="!w-4 !h-4 !text-primary mr-1" />
        {CONSTANTS.STRINGS.ADD_TABLE_BUTTON_TEXT}
      </Button>

      {isLoadingDatabaseTables || isFetchingDatabaseTables ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseTables && databaseTables.length > 0 ? (
          <div className="h-full w-full overflow-y-auto pb-10">
          {databaseTables.map((databaseTable) => {
            const key = `databaseTable_${databaseTable.databaseTableName}`;
            const isActive =
              routeParam?.databaseTableName == databaseTable.databaseTableName;

            return (
              <Link
                to={CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.path(
                  tenantID,
                  databaseSchemaName,
                  databaseTable.databaseTableName
                )}
                // to={"/"}
                key={key}
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="!w-4">
                    <FaTable className="w-4 h-4" />
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(databaseTable.databaseTableName, 15)} */}
                    {databaseTable.databaseTableName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="text-muted-foreground text-center p-4">
          <NoEntityUI message={CONSTANTS.STRINGS.TABLE_DRAWER_LIST_NO_TABLE} />
        </div>
      )}
    </div>
  );
};
