const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");

const cronJobMiddleware = {};

/**
 * Middleware to resolve workflowID from the existing cron job in the DB (for clone check)
 */
cronJobMiddleware.resolveWorkflowIDFromDB = async (req, res, next) => {
  try {
    const { cronJobID } = req.params;
    if (!cronJobID) {
      return next();
    }
    const cronJob = await prisma.tblCronJobs.findUnique({
      where: { cronJobID },
      select: { workflowID: true }
    });
    if (cronJob && cronJob.workflowID) {
      req.workflowID = cronJob.workflowID;
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "cronJobMiddleware:resolveWorkflowIDFromDB:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { cronJobMiddleware };
