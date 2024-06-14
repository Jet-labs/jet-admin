import { LOCAL_CONSTANTS } from "../constants";
import { DataSource } from "../models/data/dataSource";

import axiosInstance from "../utils/axiosInstance";

export const addDataSourceAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.DATA_SOURCE.addDataSource(),
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

export const updateDataSourceAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.DATA_SOURCE.updateDataSource(),
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

export const getDataSourceByIDAPI = async ({ dataSourceID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.DATA_SOURCE.getDataSourceByID({
        id: dataSourceID,
      })
    );
    if (response.data && response.data.success == true) {
      return new DataSource(response.data.dataSource);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDataSourceByIDAPI = async ({ dataSourceID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.DATA_SOURCE.deleteDataSourceByID({
        id: dataSourceID,
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

export const getAllDataSourceAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.DATA_SOURCE.getAllDataSources()
    );
    if (response.data && response.data.success == true) {
      return DataSource.toList(response.data.dataSources);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
