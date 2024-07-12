export class Dashboard {
  constructor({
    pm_dashboard_id,
    dashboard_title,
    dashboard_description,
    dashboard_options,
  }) {
    this.pm_dashboard_id = parseInt(pm_dashboard_id);
    this.dashboard_title = String(dashboard_title);
    this.dashboard_description = String(dashboard_description);
    this.dashboard_options =
      typeof dashboard_options === "object"
        ? dashboard_options
        : JSON.parse(dashboard_options);
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Dashboard(item);
      });
    }
  };
}
