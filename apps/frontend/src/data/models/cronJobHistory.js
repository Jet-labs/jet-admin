export class CronJobHistory {
  constructor({
    cronJobHistoryID,
    cronJobID,
    status,
    scheduledAt,
    startTime,
    endTime,
    durationMs,
    result,
    triggerType,
    createdAt,
  }) {
    this.cronJobHistoryID = cronJobHistoryID;
    this.cronJobID = cronJobID;
    this.status = status;
    this.scheduledAt = scheduledAt;
    this.startTime = startTime;
    this.endTime = endTime;
    this.durationMs = durationMs;
    this.result = result;
    this.triggerType = triggerType;
    this.createdAt = createdAt;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new CronJobHistory(item));
    }
    return [];
  }
}