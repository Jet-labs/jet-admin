export class Dashboard {
  constructor({
    pm_dashboard_id,
    pm_dashboard_title,
    pm_dashboard_description,
    pm_dashboard_options,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_dashboard_id = parseInt(pm_dashboard_id);
    this.pm_dashboard_title = String(pm_dashboard_title);
    this.pm_dashboard_description = String(pm_dashboard_description);
    this.pm_dashboard_options = pm_dashboard_options
      ? typeof pm_dashboard_options === "object"
        ? pm_dashboard_options
        : JSON.parse(pm_dashboard_options)
      : null;
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
