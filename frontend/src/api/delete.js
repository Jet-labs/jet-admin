import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const deleteRowByIDAPI = async ({ tableName, id }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.TABLE.deleteTableRowByID({
        tableName,
        id,
      })
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
