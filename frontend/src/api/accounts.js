import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const addAccountAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.ACCOUNT.addAccount(),
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

export const updateAccountAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.ACCOUNT.updateAccount(),
      data
    );

    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data && response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

export const updatePasswordAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.ACCOUNT.updatePassword(),
      data
    );

    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data && response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    console.log({ error });
    throw error;
  }
};
