/* eslint-disable no-useless-catch */
import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";
import { TenantRole } from "../models/tenantRole";
import { TenantPermission } from "../models/tenantPermission";

export const getAllTenantRolesAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.getAllTenantRolesAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return {
          roles: TenantRole.toList(response.data.roles),
          nextPage: response.data.nextPage,
        };
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

export const getTenantRoleByIDAPI = async ({ tenantID, tenantRoleID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.getTenantRoleByIDAPI(tenantID, tenantRoleID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return new TenantRole(response.data.role);
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

export const getAllTenantPermissionsAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.getAllTenantPermissionsAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data && response.data.success === true) {
        return {
          permissions: TenantPermission.toList(response.data.permissions),
          nextPage: response.data.nextPage,
        };
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

export const addTenantRoleAPI = async ({ tenantID, data }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.addTenantRoleAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(url, data, {
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

export const updateTenantRoleByIDAPI = async ({
  tenantID,
  tenantRoleID,
  data,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.updateTenantRoleByIDAPI(
        tenantID,
        tenantRoleID
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(url, data, {
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

export const deleteTenantRoleByIDAPI = async ({ tenantID, tenantRoleID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.TENANT_ROLE.deleteTenantRoleByIDAPI(
        tenantID,
        tenantRoleID
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.delete(url, {
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
