export class Trigger {
  constructor({
    pm_trigger_name,
    pm_trigger_table_name,
    pm_trigger_timing,
    pm_trigger_events,
    pm_trigger_channel_name,
    pm_trigger_condition,
  }) {
    this.pm_trigger_name = pm_trigger_name;
    this.pm_trigger_table_name = pm_trigger_table_name;

    this.pm_trigger_timing = pm_trigger_timing;
    this.pm_trigger_events = pm_trigger_events;
    this.pm_trigger_channel_name = pm_trigger_channel_name;
    this.pm_trigger_condition = pm_trigger_condition;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Trigger(item);
      });
    }
  };
}
