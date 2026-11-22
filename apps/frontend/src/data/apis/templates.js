import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";

const getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

export const listTemplatesAPI = async ({ tenantID, search, category }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TEMPLATES.listAPI(tenantID);
  const response = await axios.get(url, {
    headers: await getHeaders(),
    params: { search: search || undefined, category: category || undefined },
  });
  if (response.data?.success === true) {
    return {
      entries: response.data.entries || [],
      totalCount: response.data.totalCount || 0,
      categories: response.data.categories || [],
    };
  }
  if (response.data?.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const getTemplateAPI = async ({ tenantID, slug }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TEMPLATES.getAPI(tenantID, slug);
  const response = await axios.get(url, { headers: await getHeaders() });
  if (response.data?.success === true) return response.data;
  if (response.data?.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const installTemplateAPI = async ({ tenantID, slug, options }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TEMPLATES.installAPI(tenantID, slug);
  const response = await axios.post(url, { options }, { headers: await getHeaders() });
  if (response.data?.success === true) return response.data;
  if (response.data?.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const uninstallTemplateAPI = async ({ tenantID, slug, assetKeys }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TEMPLATES.uninstallAPI(tenantID, slug);
  const response = await axios.delete(url, {
    headers: await getHeaders(),
    data: Array.isArray(assetKeys) ? { assetKeys } : undefined,
  });
  if (response.data?.success === true) return response.data;
  if (response.data?.error) throw response.data.error;
  throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
};

export const fetchTemplateAssetBlob = async ({ tenantID, slug, assetPath }) => {
  const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.TEMPLATES.assetAPI(tenantID, slug, assetPath);
  const response = await axios.get(url, { headers: await getHeaders(), responseType: "blob" });
  return response.data;
};
