export class DashboardLayout {
  constructor({
    pm_dashboard_layout_id,
    title,
    description,
    dashboard_layout_options,
  }) {
    this.pm_dashboard_layout_id = parseInt(pm_dashboard_layout_id);
    this.title = String(title);
    this.description = String(description);
    this.dashboard_layout_options =
      typeof dashboard_layout_options === "object"
        ? dashboard_layout_options
        : JSON.parse(dashboard_layout_options);
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DashboardLayout(item);
      });
    }
  };
}
