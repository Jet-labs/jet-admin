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

export const getUserConfigAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AUTH.getUserConfigAPI(tenantID);
    console.log({ tenantID, url });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();

    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return response.data.userConfig;
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    console.log("auth token not found", error);
    throw error;
  }
};

export const updateUserConfigAPI = async ({ tenantID, config }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AUTH.updateUserConfigAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { config: config },
        {
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      );
      if (response.data && response.data.success === true) {
        return response.data.tenantID;
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
