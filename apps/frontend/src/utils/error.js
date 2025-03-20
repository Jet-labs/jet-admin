import { CONSTANTS } from "../constants";

export const extractError = (error) => {
  let err = null;
  if (error) {
    if (error.code && CONSTANTS.ERROR_CODES[error.code]) {
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
