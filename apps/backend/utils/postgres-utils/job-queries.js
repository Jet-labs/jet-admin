const jobQueryUtils = {};

jobQueryUtils.addJob = () =>
  `INSERT INTO tbl_pm_jobs (pm_job_title, pm_query_id, pm_job_schedule) VALUES (?, ?, ?)`;

jobQueryUtils.getAllJobs = (authorizedJobs) => {
  if (
    authorizedJobs === true ||
    authorizedJobs === null ||
    authorizedJobs === undefined
  ) {
    return `SELECT * FROM tbl_pm_jobs`;
  } else {
    // Fetch jobs where pm_job_id is in the authorizedJobs array
    return `SELECT * FROM tbl_pm_jobs WHERE pm_job_id IN (${authorizedJobs
      ?.map(() => "?")
      ?.join(", ")})`;
  }
};

jobQueryUtils.getJobByID = () =>
  `SELECT * FROM tbl_pm_jobs WHERE pm_job_id = ?`;

jobQueryUtils.updateJob = () =>
  `UPDATE tbl_pm_jobs SET pm_job_title = ?, pm_query_id = ?, pm_job_schedule = ?, is_disabled = ? WHERE pm_job_id = ?`;

jobQueryUtils.deleteJob = () => `DELETE FROM tbl_pm_jobs WHERE pm_job_id = ?`;

module.exports = { jobQueryUtils };
