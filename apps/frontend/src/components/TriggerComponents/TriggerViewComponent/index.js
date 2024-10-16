import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@mui/material";
import { LOCAL_CONSTANTS } from "../../../constants";
import { getTriggerByIDAPI } from "../../../api/triggers";
import { TriggerDeletionForm } from "../TriggerDeletionForm";

const TriggerViewComponent = ({ id }) => {
  const theme = useTheme();
  const {
    isLoading: isLoadingTrigger,
    data: trigger,
    error: loadTriggerError,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TRIGGERS, id],
    queryFn: () =>
      getTriggerByIDAPI({
        pmTriggerID: id,
      }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });
  return (
    <div className="w-full !h-[calc(100vh-50px)] overflow-y-auto">
      <div
        className="flex flex-col items-start justify-start p-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <span className="text-lg font-bold text-start mt-1 ">
          {LOCAL_CONSTANTS.STRINGS.TRIGGER_INFO_PAGE_TITLE}
        </span>
      </div>
      {trigger && (
        <div className="flex flex-col items-start justify-start p-3">
          <span className="text-xs font-thin  text-start mt-1">Name</span>
          <span className="text-base font-semibold text-start mt-1">
            {trigger.pm_trigger_name}
          </span>
          <span className="text-xs font-thin  text-start mt-3">Table</span>
          <span className="text-base font-semibold text-start mt-1">
            {trigger.pm_trigger_table_name}
          </span>
          <span className="text-xs font-thin  text-start mt-3">Timing</span>
          <span className="text-base font-semibold text-start mt-1">
            {trigger.pm_trigger_timing}
          </span>
          <span className="text-xs font-thin  text-start mt-3">{`Event(s)`}</span>
          <span className="text-base font-semibold text-start mt-1">
            {trigger.pm_trigger_events}
          </span>
          {trigger.pm_trigger_condition && (
            <span className="text-xs font-thin  text-start mt-3">
              Condition
            </span>
          )}
          {trigger.pm_trigger_condition && (
            <span className="text-base font-semibold text-start mt-1">
              {trigger.pm_trigger_condition}
            </span>
          )}
          {trigger.pm_trigger_channel_name && (
            <span className="text-xs font-thin  text-start mt-3">
              Channel name
            </span>
          )}
          {trigger.pm_trigger_channel_name && (
            <span className="text-base font-semibold text-start mt-1">
              {trigger.pm_trigger_channel_name}
            </span>
          )}
          {trigger.pm_trigger_function_name && (
            <span className="text-xs font-thin  text-start mt-3">
              Function name
            </span>
          )}
          {trigger.pm_trigger_function_name && (
            <span className="text-base font-semibold text-start mt-1">
              {trigger.pm_trigger_function_name}
            </span>
          )}
          <div className="!mt-5" />
          <TriggerDeletionForm id={id} />
        </div>
      )}
    </div>
  );
};

export default TriggerViewComponent;
