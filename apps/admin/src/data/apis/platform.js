import { CONSTANTS } from "@/constants";
import { operatorClient } from "@/data/http/operatorClient";
import { useAdminStore } from "@/logic/stores/useAdminStore";

const _getHeaders = () => {
  const token = useAdminStore.getState().operatorToken;
  if (!token) throw new Error("Not signed in.");
  return { Authorization: `Bearer ${token}` };
};

const _throwFromResponse = (error) => {
  const responseData = error?.response?.data;
  if (responseData && responseData.error) throw responseData.error;
  if (!error?.response) throw new Error("Cannot reach the server.");
  throw new Error("Request failed.");
};

// ─── Roles & Permissions ──────────────────────────────────────────────────

export const getAllRolesAPI = async () => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.getAllRolesAPI();
  try {
    const response = await operatorClient.get(url, { headers: _getHeaders() });
    if (response.data && response.data.success === true) {
      return response.data.roles || [];
    }
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const addRoleAPI = async ({ roleTitle, roleDescription, permissionIDs }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.addRoleAPI();
  const body = { roleTitle, roleDescription };
  if (Array.isArray(permissionIDs)) body.permissionIDs = permissionIDs;
  try {
    const response = await operatorClient.post(url, body, { headers: _getHeaders() });
    if (response.data && response.data.success === true) return response.data;
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const updateRoleAPI = async ({ roleID, roleTitle, roleDescription, permissionIDs }) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.updateRoleAPI(roleID);
  const body = {};
  if (roleTitle !== undefined) body.roleTitle = roleTitle;
  if (roleDescription !== undefined) body.roleDescription = roleDescription;
  if (permissionIDs !== undefined) body.permissionIDs = permissionIDs;
  try {
    const response = await operatorClient.patch(url, body, { headers: _getHeaders() });
    if (response.data && response.data.success === true) return response.data;
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const deleteRoleAPI = async ({ roleID }) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.deleteRoleAPI(roleID);
  try {
    const response = await operatorClient.delete(url, { headers: _getHeaders() });
    if (response.data && response.data.success === true) return response.data;
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const getAllPermissionsAPI = async () => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.getAllPermissionsAPI();
  try {
    const response = await operatorClient.get(url, { headers: _getHeaders() });
    if (response.data && response.data.success === true) {
      return response.data.permissions || [];
    }
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const createPermissionAPI = async ({
  permissionTitle,
  permissionDescription,
  mapToAdmin,
}) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.createPermissionAPI();
  const body = { permissionTitle };
  if (permissionDescription !== undefined) body.permissionDescription = permissionDescription;
  if (mapToAdmin !== undefined) body.mapToAdmin = mapToAdmin;
  try {
    const response = await operatorClient.post(url, body, { headers: _getHeaders() });
    if (response.data && response.data.success === true) return response.data;
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

// ─── Shared widget library ────────────────────────────────────────────────

export const getAllLibraryWidgetsAPI = async () => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.getAllLibraryWidgetsAPI();
  try {
    const response = await operatorClient.get(url, { headers: _getHeaders() });
    if (response.data && response.data.success === true) {
      return response.data.entries || [];
    }
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const publishBundleToLibraryAPI = async ({ bundle }) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_ADMIN.publishWidgetAPI();
  try {
    const response = await operatorClient.post(url, { bundle }, { headers: _getHeaders() });
    if (response.data && response.data.success === true) {
      return response.data.entry;
    }
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};

export const unpublishWidgetFromLibraryAPI = async ({ libraryEntryID }) => {
  const url =
    CONSTANTS.SERVER_HOST +
    CONSTANTS.APIS.OPERATOR_ADMIN.unpublishWidgetAPI(libraryEntryID);
  try {
    const response = await operatorClient.delete(url, { headers: _getHeaders() });
    if (response.data && response.data.success === true) return response.data;
    throw new Error("Request failed.");
  } catch (error) {
    return _throwFromResponse(error);
  }
};
