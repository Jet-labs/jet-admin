import { CONSTANTS } from "../../constants";
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";

const _getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

const EXPORT_API_BY_TYPE = {
  appPage: (tenantID, id) => CONSTANTS.APIS.BUNDLE.exportAppPageAPI(tenantID, id),
  workflow: (tenantID, id) => CONSTANTS.APIS.BUNDLE.exportWorkflowAPI(tenantID, id),
  dataQuery: (tenantID, id) => CONSTANTS.APIS.BUNDLE.exportDataQueryAPI(tenantID, id),
  widget: (tenantID, id) => CONSTANTS.APIS.BUNDLE.exportWidgetAPI(tenantID, id),
  listener: (tenantID, id) => CONSTANTS.APIS.BUNDLE.exportListenerAPI(tenantID, id),
};

export const exportEntityBundleAPI = async ({ tenantID, entityType, entityID }) => {
  try {
    const urlBuilder = EXPORT_API_BY_TYPE[entityType];
    if (!urlBuilder) throw new Error(`Unsupported export type: ${entityType}`);
    const url = CONSTANTS.SERVER_HOST + urlBuilder(tenantID, entityID);
    const headers = await _getHeaders();
    const response = await axios.get(url, { headers });
    if (response.data && response.data.success === true && response.data.bundle) {
      return response.data.bundle;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const previewImportBundleAPI = async ({ tenantID, bundle }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.BUNDLE.previewImportAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.post(url, { bundle }, { headers });
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
  } catch (error) {
    throw error;
  }
};

export const executeImportBundleAPI = async ({ tenantID, bundle }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.BUNDLE.executeImportAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.post(url, { bundle }, { headers });
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
  } catch (error) {
    throw error;
  }
};
