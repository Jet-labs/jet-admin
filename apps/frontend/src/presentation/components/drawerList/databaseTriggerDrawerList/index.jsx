import { FaPlus } from "react-icons/fa";
import { LuDatabaseZap } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import {
  useDatabaseTriggersActions,
  useDatabaseTriggersState,
} from "../../../../logic/contexts/databaseTriggersContext";
import { NoEntityUI } from "../../ui/noEntityUI";
export const DatabaseTriggerDrawerList = () => {
  const {
    isLoadingDatabaseTriggers,
    databaseTriggers,
    isFetchingDatabaseTriggers,
  } = useDatabaseTriggersState();
  const { refetchDatabaseTriggers } = useDatabaseTriggersActions();
  const routeParam = useParams();
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreTrigger = () => {
    navigate(
      CONSTANTS.ROUTES.ADD_DATABASE_TRIGGER.path(tenantID, databaseSchemaName)
    );
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      {/* Add Trigger Button */}
      {true && (
        <button
          onClick={_navigateToAddMoreTrigger}
          className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
        >
          <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
          {CONSTANTS.STRINGS.ADD_TRIGGER_BUTTON_TEXT}
        </button>
      )}

      {/* Trigger List */}

      {isLoadingDatabaseTriggers || isFetchingDatabaseTriggers ? (
        <div role="status" class=" animate-pulse w-full">
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div class="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseTriggers && databaseTriggers.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {databaseTriggers.map((databaseTrigger) => {
            const key = `databaseTrigger_${databaseTrigger.databaseTriggerName}`;
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
                    <LuDatabaseZap
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
                    {/* {StringUtils.truncateName(databaseTrigger.databaseTriggerName, 15)} */}
                    {`${databaseTrigger.databaseTableName}.${databaseTrigger.databaseTriggerName}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.TRIGGER_DRAWER_LIST_NO_TRIGGER}
          />
        </div>
      )}
    </div>
  );
};
