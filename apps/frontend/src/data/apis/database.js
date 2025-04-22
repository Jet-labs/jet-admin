/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { DatabaseMetadata } from "../models/databaseMetadata";

export const getDatabaseMetadataAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getDatabaseMetadataAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new DatabaseMetadata(response.data.databaseMetadata);
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

export const createDatabaseSchemaAPI = async ({
  tenantID,
  databaseSchemaName,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.createDatabaseSchemaAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { databaseSchemaName },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
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

export const executeRawSQLQueryAPI = async ({ tenantID, sqlQuery }) => {
  try {
    const url = `${
      CONSTANTS.SERVER_HOST
    }${CONSTANTS.APIS.DATABASE.executeRawSQLQueryAPI(tenantID)}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();

    if (!bearerToken) {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }

    const response = await axios.post(
      url,
      { sqlQuery },
      {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (response.data && response.data.success === true) {
      return response.data.result;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
