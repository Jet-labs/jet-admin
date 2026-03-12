import { CONSTANTS } from "../constants";

const formatValidationIssues = (issues = []) => issues
  .map((issue) => {
    const path = issue?.path;
    const message = issue?.message;

    if (!message) return null;
    return path ? `${path}: ${message}` : message;
  })
  .filter(Boolean)
  .join("; ");

export const extractError = (error) => {
  let err = null;
  if (error) {
    if (error.details?.issues?.length) {
      err = formatValidationIssues(error.details.issues);
    } else if (error.code && CONSTANTS.ERROR_CODES[error.code]) {
      err = CONSTANTS.ERROR_CODES[error.code].message;
    } else if (error.message) {
      err = error.message;
    } else if (typeof error === "string") {
      err = error;
    } else {
      err = CONSTANTS.ERROR_CODES.SERVER_ERROR.message;
    }
  }
  return err;
};
