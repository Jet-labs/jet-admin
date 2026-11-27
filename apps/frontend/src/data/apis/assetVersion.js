import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";

async function request({ tenantID, path, method = "get", data, params, signal }) {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Sign in to manage asset versions.");
  try {
    const response = await axios({
      method,
      url: `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${encodeURIComponent(
        tenantID
      )}/asset-versions${path}`,
      headers: { authorization: `Bearer ${token}` },
      data,
      params,
      signal,
    });
    if (!response.data?.success) {
      throw response.data?.error || new Error("Asset version request failed.");
    }
    return response.data;
  } catch (error) {
    const failure = error.response?.data?.error;
    if (failure) {
      throw Object.assign(new Error(failure.message), {
        code: failure.code,
        details: failure.details,
        status: error.response.status,
      });
    }
    throw error;
  }
}

export const getAssetVersionsAPI = ({
  tenantID,
  assetType,
  assetID,
  page = 1,
  pageSize = 50,
  ...options
}) =>
  request({
    ...options,
    tenantID,
    path: `/${assetType}/${assetID}/versions`,
    params: { page, pageSize },
  });

export const getAssetVersionImpactAPI = ({
  tenantID,
  assetType,
  assetID,
  versionID,
  ...options
}) =>
  request({
    ...options,
    tenantID,
    path: `/${assetType}/${assetID}/versions/${versionID}/impact`,
  });

export const getAssetVersionDiffAPI = ({
  tenantID,
  assetType,
  assetID,
  versionID,
  againstVersionID,
  ...options
}) =>
  request({
    ...options,
    tenantID,
    path: `/${assetType}/${assetID}/versions/${versionID}/diff`,
    params: againstVersionID ? { againstVersionID } : undefined,
  });

export const restoreAssetVersionAPI = ({
  tenantID,
  assetType,
  assetID,
  versionID,
  expectedUpdatedAt,
  ...options
}) =>
  request({
    ...options,
    tenantID,
    method: "post",
    path: `/${assetType}/${assetID}/versions/${versionID}/restore`,
    data: { expectedUpdatedAt },
  });

export const createAssetVersionAPI = ({
  tenantID,
  assetType,
  assetID,
  changeNote,
  ...options
}) =>
  request({
    ...options,
    tenantID,
    method: "post",
    path: `/${assetType}/${assetID}/versions`,
    data: { changeNote: changeNote?.trim() || undefined },
  });
