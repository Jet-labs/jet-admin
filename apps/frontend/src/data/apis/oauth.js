import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";

export const getOAuthUrlAPI = async ({ provider, tenantID }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OAUTH.getAuthUrlAPI(provider, tenantID);
    
    let headers = {};
    if (firebaseAuth.currentUser) {
      const token = await firebaseAuth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(url, { headers });
    
    if (response.data && response.data.success === true) {
      return response.data.url;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw new Error("Failed to retrieve OAuth URL");
    }
  } catch (error) {
    throw error;
  }
};
