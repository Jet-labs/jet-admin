const jobHistoryQueryUtils = {};

jobHistoryQueryUtils.addJobHistory = () =>
  `INSERT INTO tbl_pm_job_history (pm_history_result, pm_job_id) VALUES (?, ?)`;

jobHistoryQueryUtils.getJobHistory = (authorizedJobs, limit = 10, skip = 0) => {
  if (
    authorizedJobs === true ||
    authorizedJobs === null ||
    authorizedJobs === undefined
  ) {
    return `SELECT * FROM tbl_pm_job_history LIMIT ${limit} OFFSET ${skip}`;
  } else {
    return `SELECT * FROM tbl_pm_job_history WHERE pm_job_id IN (${authorizedJobs
      ?.map(() => "?")
      ?.join(", ")}) LIMIT ${limit} OFFSET ${skip}`;
  }
};

module.exports = { jobHistoryQueryUtils };
