const Joi = require("joi");
const Logger = require("./logger");

const validationUtils = {};

validationUtils.validateQueryResult = (result) => {
  const resultSchema = Joi.object({
    // command: Joi.string().required(),
    rowCount: Joi.number().required(),
    rows: Joi.array(),
    // fields: Joi.array(),
  });

  // Validate the result object against the schema
  const validationResult = resultSchema.validate(result);
  if (validationResult.error) {
    Logger.log("error", {
      message: "validationUtils:validateQueryResult:validation-error",
      params: { error: validationResult.error.details },
    });
    throw new Error("Query result validation failed");
  }
};

module.exports = {validationUtils};

