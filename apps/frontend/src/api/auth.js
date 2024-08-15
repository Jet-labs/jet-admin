import axios from "axios";
import { LOCAL_CONSTANTS } from "../constants";
import { PMUser } from "../models/auth/PMUser";
import axiosInstance from "../utils/axiosInstance";

export const loginAPI = async ({ username, password }) => {
  try {
    const url = LOCAL_CONSTANTS.SERVER_HOST + LOCAL_CONSTANTS.APIS.AUTH.login();
    const response = await axios.post(
      url,
      { username, password },
      { withCredentials: true }
    );
    if (response.data && response.data.success === true) {
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.REFRESH_TOKEN_LOCAL_STORAGE,
        response.data.refreshToken
      );
      localStorage.setItem(
        LOCAL_CONSTANTS.STRINGS.ACCESS_TOKEN_LOCAL_STORAGE,
        response.data.accessToken
      );
      return response.data.accessToken;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const url =
      LOCAL_CONSTANTS.SERVER_HOST +
      LOCAL_CONSTANTS.APIS.AUTH.refreshAccessToken();
    const response = await axios.post(url, {
      refreshToken: localStorage.getItem(
        LOCAL_CONSTANTS.STRINGS.REFRESH_TOKEN_LOCAL_STORAGE
      ),
    });
    if (response.data && response.data.success === true) {
      return response.data.accessToken;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.USER_REFRESH_TOKEN_EXPIRED;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchDBUserAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.AUTH.getSelf()
    );
    if (response.data && response.data.success === true) {
      return new PMUser(response.data.pmUser);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
