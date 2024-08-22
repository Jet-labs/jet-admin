const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { jobController } = require("./job.controller");
const {
  jobAuthorizationMiddleware,
} = require("./job.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizedJobsForRead,
  jobController.getAllJobs
);
router.get(
  "/history",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizedJobsForRead,
  jobController.getJobHistory
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizedJobsForRead,
  jobController.getJobByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizationForJobAddition,
  jobController.addJob
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizedJobsForUpdate,
  jobController.updateJob
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  jobAuthorizationMiddleware.populateAuthorizedJobsForDelete,
  jobController.deleteJob
);

module.exports = router;
