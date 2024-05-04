import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const sendActionAPI = async ({ action, data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.ACTION.sendAction({
        action,
      }),
      data
    );
    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
