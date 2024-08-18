export const generateCreateTriggerQuery = ({
  schema_name,
  pm_trigger_name,
  pm_trigger_table_name,
  pm_trigger_timing,
  pm_trigger_events,
  pm_trigger_method,
  pm_trigger_condition,
  pm_trigger_channel_name,
}) =>
  `CREATE TRIGGER ${pm_trigger_name} ${pm_trigger_timing} ${pm_trigger_events.join(
    " OR "
  )} ON ${
    schema_name ? schema_name + "." : "public."
  }${pm_trigger_table_name} ${
    pm_trigger_condition ? `WHEN (${pm_trigger_condition})` : ""
  } ${pm_trigger_method} EXECUTE FUNCTION pm_trigger_notify_event('${pm_trigger_events.join(
    ", "
  )}','${pm_trigger_channel_name}');`;
