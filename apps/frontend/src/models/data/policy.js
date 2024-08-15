export class Policy {
  constructor({ pm_policy_object_id, title, policy, created_at, is_disabled }) {
    this.pmPolicyObjectID = parseInt(pm_policy_object_id);
    this.pmPolicyObjectTitle = String(title);
    this.pmPolicyObject = JSON.parse(policy);
    this.createdAt = new Date(created_at);
    this.isDisabled = new Boolean(is_disabled);
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Policy(item);
      });
    }
  };
}
