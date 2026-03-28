export class CronJob {
  constructor({
    cronJobID,
    cronJobTitle,
    cronJobDescription,
    cronJobSchedule,
    workflowID,
    workflowConfig,
    isDisabled,
    nextRunAt,
    timeoutSeconds,
    retryAttempts,
    retryDelaySeconds,
    tenantID,
    createdAt,
    updatedAt,
  }) {
    this.cronJobID = cronJobID;
    this.cronJobTitle = cronJobTitle;
    this.cronJobDescription = cronJobDescription;
    this.cronJobSchedule = cronJobSchedule;
    this.workflowID = workflowID;
    this.workflowConfig = workflowConfig;
    this.isDisabled = isDisabled;
    this.nextRunAt = nextRunAt;
    this.timeoutSeconds = timeoutSeconds;
    this.retryAttempts = retryAttempts;
    this.retryDelaySeconds = retryDelaySeconds;
    this.tenantID = tenantID;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new CronJob(item));
    }
    return [];
  }
}