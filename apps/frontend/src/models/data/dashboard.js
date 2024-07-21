export class Dashboard {
  constructor({
    pm_dashboard_id,
    dashboard_title,
    dashboard_description,
    dashboard_options,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_dashboard_id = parseInt(pm_dashboard_id);
    this.dashboard_title = String(dashboard_title);
    this.dashboard_description = String(dashboard_description);
    this.dashboard_options =
      typeof dashboard_options === "object"
        ? dashboard_options
        : JSON.parse(dashboard_options);
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Dashboard(item);
      });
    }
  };
}
