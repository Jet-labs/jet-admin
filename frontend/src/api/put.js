import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const updateRowAPI = async ({ tableName, id, data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.TABLE.updateTableRowByID({
        tableName,
        id,
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
