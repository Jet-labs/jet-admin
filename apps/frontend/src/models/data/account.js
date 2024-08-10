export class Account {
  constructor({
    pm_user_id,
    username,
    first_name,
    address1,
    pm_policy_object_id,
    email,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
    tbl_pm_policy_objects,
  }) {
    this.pm_user_id = pm_user_id;
    this.username = username;
    this.first_name = first_name;
    this.address1 = address1;
    this.pm_policy_object_id = pm_policy_object_id;
    this.email = email;
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
    this.is_profile_complete = this.first_name && this.email && this.address1;

    this.tbl_pm_policy_objects = tbl_pm_policy_objects;
    this.policy = tbl_pm_policy_objects ? tbl_pm_policy_objects.policy : null;
  }

  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Account(item);
      });
    }
  };
}
