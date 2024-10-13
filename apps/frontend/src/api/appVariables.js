import axios from "axios";
import { LOCAL_CONSTANTS } from "../constants";
import { AppVariable } from "../models/data/appVariable";
import axiosInstance from "../utils/axiosInstance";

export const addAppVariableAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.addAppVariable(),
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

export const updateAppVariableAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.updateAppVariable(),
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
    throw error;
  }
};

export const getAppVariableByIDAPI = async ({ pmAppVariableID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.getAppVariableByID({
        id: pmAppVariableID,
      })
    );
    if (response.data && response.data.success == true) {
      return new AppVariable(response.data.appVariable);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteAppVariableByIDAPI = async ({ pmAppVariableID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.deleteAppVariableByID({
        id: pmAppVariableID,
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

export const getAllAppVariableAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.getAllAppVariables()
    );
    if (response.data && response.data.success == true) {
      return AppVariable.toList(response.data.appVariables);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllInternalAppVariableAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.APP_VARIABLESS.getAllInternalAppVariables()
    );
    if (response.data && response.data.success == true) {
      return AppVariable.toList(response.data.appVariables);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
