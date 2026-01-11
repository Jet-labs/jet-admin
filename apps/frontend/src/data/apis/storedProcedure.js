/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";

/**
 * Get all stored procedures for a schema (true procedures only)
 */
export const getAllStoredProceduresAPI = async ({
  tenantID,
  databaseSchemaName,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data.storedProcedures;
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

/**
 * Get a specific stored procedure by name
 */
export const getStoredProcedureByNameAPI = async ({
  tenantID,
  databaseSchemaName,
  procedureName,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures/${procedureName}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data.storedProcedure;
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

/**
 * Execute a stored procedure (uses CALL syntax)
 */
export const executeStoredProcedureAPI = async ({
  tenantID,
  databaseSchemaName,
  procedureName,
  args = [],
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures/${procedureName}/execute`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { args },
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
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new stored procedure
 */
export const createStoredProcedureAPI = async ({
  tenantID,
  databaseSchemaName,
  procedureName,
  parameters = [],
  language = "plpgsql",
  body,
  securityDefiner = false,
  orReplace = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(url, {
        procedureName,
        parameters,
        language,
        body,
        securityDefiner,
        orReplace,
      }, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Update a stored procedure
 */
export const updateStoredProcedureAPI = async ({
  tenantID,
  databaseSchemaName,
  procedureName,
  parameters = [],
  language = "plpgsql",
  body,
  securityDefiner = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures/${procedureName}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.put(url, {
        parameters,
        language,
        body,
        securityDefiner,
      }, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Delete a stored procedure
 */
export const deleteStoredProcedureAPI = async ({
  tenantID,
  databaseSchemaName,
  procedureName,
  argumentTypes = "",
  cascade = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/procedures/${procedureName}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.delete(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
        data: { argumentTypes, cascade },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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
