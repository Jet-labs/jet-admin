import { toast } from "react-toastify";
import { extractError } from "./error";
import { LOCAL_CONSTANTS } from "../constants";

export const displayError = (error) => {
  const extError = extractError(error);
  toast.error(extError, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: localStorage.getItem(
      LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
    ),
  });
};

export const displaySuccess = (message) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: localStorage.getItem(
      LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
    ),
  });
};

export const displayInfo = (message) => {
  toast.info(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: localStorage.getItem(
      LOCAL_CONSTANTS.STRINGS.THEME_LOCAL_STORAGE_STRING
    ),
  });
};
