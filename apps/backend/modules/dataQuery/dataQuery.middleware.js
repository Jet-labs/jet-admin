const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");

const dataQueryMiddleware = {};

/**
 * Middleware to resolve datasourceID from the existing dataQuery in the DB (for clone check)
 */
dataQueryMiddleware.resolveDatasourceIDFromDB = async (req, res, next) => {
  try {
    const { dataQueryID } = req.params;
    if (!dataQueryID) {
      return next();
    }
    const dataQuery = await prisma.tblDataQueries.findUnique({
      where: { dataQueryID },
      select: { datasourceID: true }
    });
    if (dataQuery && dataQuery.datasourceID) {
      req.datasourceID = dataQuery.datasourceID;
    }
    next();
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryMiddleware:resolveDatasourceIDFromDB:error",
      params: { error: error.message }
    });
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.SERVER_ERROR, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { dataQueryMiddleware };
