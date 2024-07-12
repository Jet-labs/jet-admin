import { LOCAL_CONSTANTS } from "../constants";
export const extractError = (error) => {
  let err = null;
  if (error) {
    if (error.code && LOCAL_CONSTANTS.ERROR_CODES[error.code]) {
      err = LOCAL_CONSTANTS.ERROR_CODES[error.code].message;
    } else if (error.message) {
      err = error.message;
    } else {
      err = LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR.message;
    }
  }
  return err;
};

