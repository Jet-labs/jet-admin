const jobHistoryQueryUtils = {};

jobHistoryQueryUtils.addJobHistory = () =>
  `INSERT INTO tbl_pm_job_history (history_result, pm_job_id) VALUES (?, ?)`;

jobHistoryQueryUtils.getJobHistory = (authorizedJobs) => {
  if (
    authorizedJobs === true ||
    authorizedJobs === null ||
    authorizedJobs === undefined
  ) {
    return `SELECT * FROM tbl_pm_job_history`;
  } else {
    // Fetch jobs where pm_job_id is in the authorizedJobs array
    return `SELECT * FROM tbl_pm_job_history WHERE pm_job_id IN (${authorizedJobs
      .map(() => "?")
      .join(", ")})`;
  }
};

module.exports = { jobHistoryQueryUtils };
