export class CronJobHistory {
  constructor({
    jobHistoryID,
    jobID,
    status,
    scheduledAt,
    startTime,
    endTime,
    durationMs,
    output,
    triggerType,
    createdAt,
  }) {
    this.jobHistoryID = jobHistoryID;
    this.jobID = jobID;
    this.status = status;
    this.scheduledAt = scheduledAt;
    this.startTime = startTime;
    this.endTime = endTime;
    this.durationMs = durationMs;
    this.output = output;
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