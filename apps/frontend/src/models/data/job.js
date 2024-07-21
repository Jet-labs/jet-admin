export class Job {
  constructor({
    pm_job_id,
    pm_job_title,
    pm_query_id,
    pm_job_schedule,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_job_id = parseInt(pm_job_id);
    this.pm_job_title = String(pm_job_title);
    this.pm_query_id = String(pm_query_id);
    this.pm_job_schedule = String(pm_job_schedule);
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Job(item);
      });
    }
  };
}
