import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const getGraphAPI = async ({ id }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.GRAPH.getGraphData({
        id,
      })
    );
    if (response.data && response.data.success == true) {
      return response.data;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
