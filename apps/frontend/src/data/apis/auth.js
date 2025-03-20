import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";
import { User } from "../models/user";

export const getUserInfoAPI = async () => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AUTH.getUserInfoAPI();
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return new User({ ...response.data.user });
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error;
  }
};
