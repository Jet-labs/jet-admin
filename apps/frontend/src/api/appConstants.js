import axios from "axios";
import { LOCAL_CONSTANTS } from "../constants";
import { AppConstant } from "../models/data/appConstant";
import axiosInstance from "../utils/axiosInstance";
export const getDBModelAppConstantAPI = async () => {
  try {
    const url =
      LOCAL_CONSTANTS.SERVER_HOST +
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.getDBModelAppConstant();

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

export const addAppConstantAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.addAppConstant(),
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

export const updateAppConstantAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.updateAppConstant(),
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

export const getAppConstantByIDAPI = async ({ appConstantID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.getAppConstantByID({
        id: appConstantID,
      })
    );
    if (response.data && response.data.success == true) {
      return new AppConstant(response.data.appConstant);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteAppConstantByIDAPI = async ({ appConstantID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.deleteAppConstantByID({
        id: appConstantID,
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

export const getAllAppConstantAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.getAllAppConstants()
    );
    if (response.data && response.data.success == true) {
      return AppConstant.toList(response.data.appConstants);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllInternalAppConstantAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_CONSTANTS.getAllInternalAppConstants()
    );
    if (response.data && response.data.success == true) {
      return AppConstant.toList(response.data.appConstants);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
