import { CONSTANTS } from "../../constants";
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";

const _getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

export const listMarketplaceItemsAPI = async ({
  tenantID,
  search,
  itemType,
  category,
  page,
  pageSize,
}) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.MARKETPLACE.listItemsAPI(tenantID);
  const headers = await _getHeaders();
  const response = await axios.get(url, {
    headers,
    params: { search, itemType, category, page, pageSize },
  });
  if (response.data && response.data.success === true) {
    return {
      entries: response.data.entries || [],
      totalCount: response.data.totalCount || 0,
      page: response.data.page || 1,
      pageSize: response.data.pageSize || 0,
      totalPages: response.data.totalPages || 1,
    };
  }
  if (response.data.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const getMarketplaceItemAPI = async ({ tenantID, itemID }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.MARKETPLACE.getItemAPI(tenantID, itemID);
  const headers = await _getHeaders();
  const response = await axios.get(url, { headers });
  if (response.data && response.data.success === true) return response.data.item;
  if (response.data.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const previewMarketplaceInstallAPI = async ({
  tenantID,
  itemID,
  selectedItemKeys,
}) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.MARKETPLACE.previewInstallAPI(tenantID, itemID);
  const headers = await _getHeaders();
  const response = await axios.post(
    url,
    { ...(selectedItemKeys ? { selectedItemKeys } : {}) },
    { headers }
  );
  if (response.data && response.data.success === true) {
    return {
      valid: response.data.valid,
      summary: response.data.summary,
      items: response.data.items || [],
      selection: response.data.selection || [],
      selectedCount: response.data.selectedCount ?? 0,
      totalCount: response.data.totalCount ?? 0,
    };
  }
  if (response.data.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const installMarketplaceItemAPI = async ({
  tenantID,
  itemID,
  selectedItemKeys,
}) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.MARKETPLACE.installItemAPI(tenantID, itemID);
  const headers = await _getHeaders();
  const response = await axios.post(
    url,
    { ...(selectedItemKeys ? { selectedItemKeys } : {}) },
    { headers }
  );
  if (response.data && response.data.success === true) {
    return {
      results: response.data.results || [],
      skipped: response.data.skipped || [],
      warnings: response.data.warnings || [],
    };
  }
  if (response.data.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};
