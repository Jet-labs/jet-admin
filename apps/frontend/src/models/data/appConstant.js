export class AppConstant {
  constructor({
    pm_app_constant_id,
    pm_app_constant_title,
    pm_app_constant_value,
    is_internal,
  }) {
    this.pm_app_constant_id = pm_app_constant_id;
    this.pm_app_constant_title = pm_app_constant_title;
    this.pm_app_constant_value = pm_app_constant_value;
    this.is_internal = is_internal;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new AppConstant(item);
      });
    }
  };
}
