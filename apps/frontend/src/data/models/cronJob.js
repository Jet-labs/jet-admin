export class CronJob {
  constructor({
    cronJobID,
    cronJobTitle,
    cronJobDescription,
    cronJobSchedule,
    databaseQueryID,
    isDisabled,
    nextRunAt,
    timeoutSeconds,
    retryAttempts,
    retryDelaySeconds,
    createdAt,
    updatedAt,
  }) {
    this.cronJobID = cronJobID;
    this.cronJobTitle = cronJobTitle;
    this.cronJobDescription = cronJobDescription;
    this.cronJobSchedule = cronJobSchedule;
    this.databaseQueryID = databaseQueryID;
    this.isDisabled = isDisabled;
    this.nextRunAt = nextRunAt;
    this.timeoutSeconds = timeoutSeconds;
    this.retryAttempts = retryAttempts;
    this.retryDelaySeconds = retryDelaySeconds;
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