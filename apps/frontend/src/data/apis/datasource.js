/* eslint-disable no-useless-catch */
import { CONSTANTS } from "../../constants";

import axios from "axios";
import { Datasource } from "../models/datasource";
import { firebaseAuth } from "../../config/firebase";

export const getAllDatasourcesAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATASOURCE.getAllDatasourcesAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return Datasource.toList(response.data.datasources);
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

export const testDatasourceConnectionAPI = async ({
  tenantID,
  datasourceType,
  datasourceOptions,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATASOURCE.testDatasourceConnectionAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          datasourceType,
          datasourceOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return Boolean(response.data.connectionResult);
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


export const createDatasourceAPI = async ({
  tenantID,
  datasourceTitle,
  datasourceType,
  datasourceOptions,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATASOURCE.createDatasourceAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          datasourceTitle,
          datasourceType,
          datasourceOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return true;
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

export const updateDatasourceAPI = async ({
  tenantID,
  datasourceID,
  datasourceTitle,
  datasourceType,
  datasourceOptions,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATASOURCE.updateDatasourceByIDAPI(tenantID, datasourceID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        {
          datasourceTitle,
          datasourceType,
          datasourceOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return true;
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




