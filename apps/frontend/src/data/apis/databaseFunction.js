/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";

/**
 * Get all functions for a schema
 */
export const getAllFunctionsAPI = async ({
  tenantID,
  databaseSchemaName,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data.functions;
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
 * Get a specific function by name
 */
export const getFunctionByNameAPI = async ({
  tenantID,
  databaseSchemaName,
  functionName,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions/${functionName}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data.function;
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
 * Execute a function with arguments
 */
export const executeFunctionAPI = async ({
  tenantID,
  databaseSchemaName,
  functionName,
  args = [],
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions/${functionName}/execute`;
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
 * Create a new function
 */
export const createFunctionAPI = async ({
  tenantID,
  databaseSchemaName,
  functionName,
  parameters = [],
  returnType = "void",
  language = "plpgsql",
  body,
  volatility = "VOLATILE",
  securityDefiner = false,
  strict = false,
  orReplace = false,
  returnsSet = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(url, {
        functionName,
        parameters,
        returnType,
        language,
        body,
        volatility,
        securityDefiner,
        strict,
        orReplace,
        returnsSet,
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
 * Update a function
 */
export const updateFunctionAPI = async ({
  tenantID,
  databaseSchemaName,
  functionName,
  parameters = [],
  returnType = "void",
  language = "plpgsql",
  body,
  volatility = "VOLATILE",
  securityDefiner = false,
  strict = false,
  returnsSet = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions/${functionName}`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.put(url, {
        parameters,
        returnType,
        language,
        body,
        volatility,
        securityDefiner,
        strict,
        returnsSet,
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
 * Delete a function
 */
export const deleteFunctionAPI = async ({
  tenantID,
  databaseSchemaName,
  functionName,
  argumentTypes = "",
  cascade = false,
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/schemas/${databaseSchemaName}/functions/${functionName}`;
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
