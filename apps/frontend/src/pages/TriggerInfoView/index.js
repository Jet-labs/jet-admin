import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { LOCAL_CONSTANTS } from "../../constants";
import { getTriggerByIDAPI } from "../../api/triggers";
import { useTheme } from "@mui/material";

const TriggerInfoView = () => {
  const { id } = useParams();
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
    retry: 1,
    staleTime: 0,
  });
  const rows = trigger ? Object.entries(trigger) : null;
  return (
    <div className="w-full !h-[calc(100vh-50px)] overflow-y-scroll">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 w-full"
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
        <div className="flex flex-col items-start justify-start p-3 px-6 w-full">
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
        </div>
      )}
    </div>
  );
};

export default TriggerInfoView;
