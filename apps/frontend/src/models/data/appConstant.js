export class AppConstant {
  constructor({
    pm_app_constant_id,
    pm_app_constant_title,
    pm_app_constant_value,
    is_internal,
  }) {
    this.pm_app_constant_id = pm_app_constant_id;
    this.pm_app_constant_title = pm_app_constant_title;
    this.pm_app_constant_value = pm_app_constant_value?
      typeof pm_app_constant_value === "object"
        ? pm_app_constant_value
        : JSON.parse(pm_app_constant_value):null;
    this.is_internal = is_internal;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      console.log({data})
      return data.map((item) => {
        return new AppConstant(item);
      });
    }
  };
}
