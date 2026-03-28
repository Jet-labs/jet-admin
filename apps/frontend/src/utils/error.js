import { CONSTANTS } from "../constants";

/**
 * Formats Zod validation issues into a human-readable string.
 * @param {Array} issues - Array of Zod issue objects
 * @returns {string} Semicolon-separated issue descriptions
 */
const formatValidationIssues = (issues = []) => issues
  .map((issue) => {
    const path = issue?.path;
    const message = issue?.message;

    if (!message) return null;
    return path ? `${path}: ${message}` : message;
  })
  .filter(Boolean)
  .join("; ");

/**
 * Universal error extractor for frontend error handling.
 * Handles all error shapes coming from:
 *  - Axios responses (error.response.data.error)
 *  - Zod validation issues (error.details.issues)
 *  - Application error codes (error.code)
 *  - Error instances (error.message)
 *  - Plain strings
 *
 * @param {*} error - Any error shape
 * @returns {string|null} Human-readable error message
 */
export const extractError = (error) => {
  if (!error) return null;

  // 1. Axios response wrapper — { response: { data: { error: { ... } } } }
  const axiosError = error?.response?.data?.error;
  if (axiosError) {
    // Recurse into the nested error payload
    return extractError(axiosError);
  }

  // 2. Zod validation issues — { details: { issues: [...] } }
  if (error.details?.issues?.length) {
    return formatValidationIssues(error.details.issues);
  }

  // 3. Application error codes — { code: "DUPLICATE_ENTRY" }
  if (error.code && CONSTANTS.ERROR_CODES?.[error.code]) {
    return CONSTANTS.ERROR_CODES[error.code].message;
  }

  // 4. Standard Error instances — { message: "..." }
  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  // 5. Plain strings
  if (typeof error === "string") {
    return error;
  }

  // 6. Fallback
  return CONSTANTS.ERROR_CODES?.SERVER_ERROR?.message || "Something went wrong";
};
