import { CONSTANTS } from "../../constants";
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";

const _getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

export const getAllLibraryWidgetsAPI = async ({
  tenantID,
  search,
  page,
  pageSize,
}) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.WIDGET_LIBRARY.getAllWidgetsAPI(tenantID);
  const headers = await _getHeaders();
  const response = await axios.get(url, {
    headers,
    params: { search, page, pageSize },
  });
  if (response.data && response.data.success === true) {
    return {
      entries: response.data.entries || [],
      totalCount: response.data.totalCount || 0,
      page: response.data.page || 1,
      pageSize: response.data.pageSize || 0,
      totalPages: response.data.totalPages || 1,
    };
  } else if (response.data.error) {
    throw response.data.error;
  } else {
    throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  }
};

export const publishWidgetToLibraryAPI = async ({ tenantID, bundle }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.WIDGET_LIBRARY.publishWidgetAPI(tenantID);
  const headers = await _getHeaders();
  const response = await axios.post(url, { bundle }, { headers });
  if (response.data && response.data.success === true) {
    return response.data.entry;
  } else if (response.data.error) {
    throw response.data.error;
  } else {
    throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  }
};

export const unpublishWidgetFromLibraryAPI = async ({ tenantID, libraryEntryID }) => {
  const url =
    CONSTANTS.SERVER_HOST +
    CONSTANTS.APIS.WIDGET_LIBRARY.unpublishWidgetAPI(tenantID, libraryEntryID);
  const headers = await _getHeaders();
  const response = await axios.delete(url, { headers });
  if (response.data && response.data.success === true) {
    return response.data;
  } else if (response.data.error) {
    throw response.data.error;
  } else {
    throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  }
};

export const previewWidgetInstallAPI = async ({ tenantID, libraryEntryID }) => {
  const url =
    CONSTANTS.SERVER_HOST +
    CONSTANTS.APIS.WIDGET_LIBRARY.previewInstallAPI(tenantID, libraryEntryID);
  const headers = await _getHeaders();
  const response = await axios.post(url, {}, { headers });
  if (response.data && response.data.success === true) {
    return {
      valid: response.data.valid,
      summary: response.data.summary,
      items: response.data.items || [],
    };
  } else if (response.data.error) {
    throw response.data.error;
  } else {
    throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  }
};

export const installWidgetAPI = async ({ tenantID, libraryEntryID }) => {
  const url =
    CONSTANTS.SERVER_HOST +
    CONSTANTS.APIS.WIDGET_LIBRARY.installWidgetAPI(tenantID, libraryEntryID);
  const headers = await _getHeaders();
  const response = await axios.post(url, {}, { headers });
  if (response.data && response.data.success === true) {
    return {
      results: response.data.results || [],
      skipped: response.data.skipped || [],
      warnings: response.data.warnings || [],
    };
  } else if (response.data.error) {
    throw response.data.error;
  } else {
    throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  }
};
