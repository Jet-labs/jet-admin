/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { Tenant } from "../models/tenant";

export const getUserTenantByIDAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT.getUserTenantByIDAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return new Tenant({ ...response.data.tenant });
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

export const getAllUserTenantsAPI = async () => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TENANT.getAllUserTenantsAPI();
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return Tenant.toList(response.data.tenants);
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

export const createNewTenantAPI = async ({
  tenantTitle,
  tenantLogoURL,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TENANT.createNewTenantAPI();
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { tenantTitle, tenantLogoURL },
        {
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      );
      if (response.data && response.data.success === true) {
        return new Tenant({ ...response.data.tenant });
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



export const updateTenantAPI = async ({
  tenantID,
  tenantTitle,
  tenantLogoURL,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TENANT.updateTenantAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        { tenantTitle, tenantLogoURL },
        {
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      );
      if (response.data && response.data.success === true) {
        return new Tenant({ ...response.data.tenant });
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

export const getAllTenantUsersAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT.getAllTenantUsersAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return response.data.userTenantRelationships;
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

export const deleteUserTenantByIDAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT.deleteUserTenantByIDAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
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