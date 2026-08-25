import { CONSTANTS } from "../../constants";
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";

const _getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

export const getAllFoldersAPI = async ({ tenantID, entityType }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.FOLDER.getAllFoldersAPI(tenantID, entityType);
    const headers = await _getHeaders();
    const response = await axios.get(url, { headers });
    if (response.data && response.data.success === true) {
      return response.data.folders || [];
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const createFolderAPI = async ({ tenantID, entityType, folderTitle, parentFolderID }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.FOLDER.createFolderAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.post(
      url,
      { entityType, folderTitle, parentFolderID: parentFolderID ?? null },
      { headers }
    );
    if (response.data && response.data.success === true) {
      return response.data.folder;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const updateFolderAPI = async ({ tenantID, folderID, folderTitle, parentFolderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.FOLDER.updateFolderAPI(tenantID, folderID);
    const headers = await _getHeaders();
    const body = {};
    if (folderTitle !== undefined) body.folderTitle = folderTitle;
    if (parentFolderID !== undefined) body.parentFolderID = parentFolderID;
    const response = await axios.patch(url, body, { headers });
    if (response.data && response.data.success === true) {
      return response.data.folder;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteFolderAPI = async ({ tenantID, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.FOLDER.deleteFolderAPI(tenantID, folderID);
    const headers = await _getHeaders();
    const response = await axios.delete(url, { headers });
    if (response.data && response.data.success === true) {
      return response.data;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const moveEntitiesToFolderAPI = async ({ tenantID, entityType, entityIDs, folderID }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.FOLDER.moveEntitiesAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.post(
      url,
      { entityType, entityIDs, folderID: folderID ?? null },
      { headers }
    );
    if (response.data && response.data.success === true) {
      return response.data;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
