export class AppVariable {
  constructor({
    pm_app_variable_id,
    pm_app_variable_title,
    pm_app_variable_value,
    is_internal,
  }) {
    this.pm_app_variable_id = pm_app_variable_id;
    this.pm_app_variable_title = pm_app_variable_title;
    this.pm_app_variable_value = pm_app_variable_value
      ? typeof pm_app_variable_value === "object"
        ? pm_app_variable_value
        : JSON.parse(pm_app_variable_value)
      : null;
    this.is_internal = is_internal;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      console.log({ data });
      return data.map((item) => {
        return new AppVariable(item);
      });
    }
  };
}
