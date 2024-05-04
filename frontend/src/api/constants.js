import axios from "axios";
import { LOCAL_CONSTANTS } from "../constants";
export const fetchRemoteConstantsAPI = async () => {
  try {
    const url =
      LOCAL_CONSTANTS.SERVER_HOST +
      LOCAL_CONSTANTS.APIS.CONSTANTS.fetchRemoteConstants();

    const response = await axios.get(url);
    if (response.data && response.data.success === true) {
      return response.data.constants;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};
