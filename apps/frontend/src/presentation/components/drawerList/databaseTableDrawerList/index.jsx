import { FaPlus, FaTable } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import {
  useDatabaseTablesActions,
  useDatabaseTablesState,
} from "../../../../logic/contexts/databaseTablesContext";
export const DatabaseTableDrawerList = ({}) => {
  const { isLoadingDatabaseTables, isFetchingDatabaseTables, databaseTables } =
    useDatabaseTablesState();
  const { refetchDatabaseTables } = useDatabaseTablesActions();
  const routeParam = useParams();
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreTable = () => {
    navigate(
      CONSTANTS.ROUTES.ADD_DATABASE_TABLE.path(tenantID, databaseSchemaName)
    );
  };

  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      {/* Add Table Button */}
      {true && (
        <button
          onClick={_navigateToAddMoreTable}
          className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
        >
          <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.ADD_TABLE_BUTTON_TEXT}
        </button>
      )}

      {isLoadingDatabaseTables || isFetchingDatabaseTables ? (
        <div role="status" class=" animate-pulse w-full">
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseTables && databaseTables.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
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
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="!w-[16px]">
                    <FaTable
                      className={`w-[16px] h-[16px] ${
                        isActive ? "text-primary" : "text-slate-600"
                      }`}
                    />
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
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI message={CONSTANTS.STRINGS.TABLE_DRAWER_LIST_NO_TABLE} />
        </div>
      )}
    </div>
  );
};
