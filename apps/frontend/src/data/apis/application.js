import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";

async function request({ tenantID, path = "", method = "get", data, params, signal }) {
  const token = await firebaseAuth.currentUser?.getIdToken();
  if (!token) throw new Error("Sign in to manage applications.");
  try {
    const response = await axios({
      method, url: `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${encodeURIComponent(tenantID)}/applications${path}`,
      headers: { authorization: `Bearer ${token}` }, data, params, signal,
    });
    if (!response.data?.success) throw response.data?.error || new Error("Application request failed.");
    return response.data;
  } catch (error) {
    const failure = error.response?.data?.error;
    if (failure) throw Object.assign(new Error(failure.message), { code: failure.code, details: failure.details, status: error.response.status });
    throw error;
  }
}
export const listApplicationsAPI = options => request(options);
export const createApplicationAPI = options => request({ ...options, method: "post" });
export const getApplicationAPI = ({ applicationID, ...options }) => request({ ...options, path: `/${applicationID}` });
export const saveApplicationDraftAPI = ({ applicationID, ...options }) => request({ ...options, method: "patch", path: `/${applicationID}/draft` });
export const linkApplicationPageAPI = ({ applicationID, ...options }) => request({ ...options, method: "post", path: `/${applicationID}/assets/pages` });
export const unlinkApplicationAssetAPI = ({ applicationID, assetKey, ...options }) => request({ ...options, method: "delete", path: `/${applicationID}/assets/${encodeURIComponent(assetKey)}` });
export const selectApplicationPageVersionAPI = ({ applicationID, assetKey, ...options }) => request({ ...options, method: "patch", path: `/${applicationID}/assets/${encodeURIComponent(assetKey)}/version` });
export const previewApplicationAPI = ({ applicationID, ...options }) => request({ ...options, method: "post", path: `/${applicationID}/preview` });
export const archiveApplicationAPI = ({ applicationID, ...options }) => request({ ...options, method: "post", path: `/${applicationID}/archive` });
export const publishApplicationReleaseAPI = ({ applicationID, ...options }) => request({ ...options, method: "post", path: `/${applicationID}/releases` });
export const listApplicationReleasesAPI = ({ applicationID, ...options }) => request({ ...options, path: `/${applicationID}/releases` });
export const listApplicationWorkflowRunsAPI = ({ applicationID, environment = "production", limit = 50, ...options }) => request({ ...options, path: `/${applicationID}/runs`, params: { environment, limit } });
export const getApplicationEnvironmentAPI = ({ applicationID, environment = "production", ...options }) => request({ ...options, path: `/${applicationID}/environments/${encodeURIComponent(environment)}` });
export const updateApplicationEnvironmentBindingsAPI = ({ applicationID, environment = "production", ...options }) => request({ ...options, method: "put", path: `/${applicationID}/environments/${encodeURIComponent(environment)}/bindings` });
export const getApplicationConsumerPolicyAPI = ({ applicationID, ...options }) => request({ ...options, path: `/${applicationID}/consumer-policy` });
export const updateApplicationConsumerPolicyAPI = ({ applicationID, ...options }) => request({ ...options, method: "put", path: `/${applicationID}/consumer-policy` });
export const deployApplicationReleaseAPI = ({ applicationID, environment = "production", ...options }) => request({ ...options, method: "post", path: `/${applicationID}/environments/${encodeURIComponent(environment)}/deployments` });
export const getApplicationRuntimeManifestAPI = ({ applicationID, environment = "production", ...options }) => request({ ...options, path: `/${applicationID}/runtime/${encodeURIComponent(environment)}/manifest` });
export const getApplicationRuntimePageManifestAPI = async ({ applicationID, environment = "production", pageAssetKey, routeID, ...options }) => {
  const response = await request({
    ...options,
    path: `/${applicationID}/runtime/${encodeURIComponent(environment)}/pages/${encodeURIComponent(pageAssetKey)}/manifest`,
    params: { ...(options.params || {}), ...(routeID ? { routeID } : {}) },
  });
  return response.manifest;
};
export const runApplicationRuntimeQueryAPI = async ({ applicationID, environment = "production", pageAssetKey, alias, ...options }) => {
  const response = await request({
    ...options,
    method: "post",
    path: `/${applicationID}/runtime/${encodeURIComponent(environment)}/pages/${encodeURIComponent(pageAssetKey)}/data-sources/${encodeURIComponent(alias)}/execute`,
  });
  return response.dataQueryResult;
};

const runtimeSourcePath = ({ applicationID, environment = "production", pageAssetKey, alias }) =>
  `/${applicationID}/runtime/${encodeURIComponent(environment)}/pages/${encodeURIComponent(pageAssetKey)}/data-sources/${encodeURIComponent(alias)}`;
export const getApplicationWorkflowRunAPI = async ({ instanceID, ...options }) => {
  const response = await request({ ...options, path: `${runtimeSourcePath(options)}/runs/${encodeURIComponent(instanceID)}` });
  return response.run;
};
export const cancelApplicationWorkflowRunAPI = ({ instanceID, ...options }) =>
  request({ ...options, method: "post", data: {}, path: `${runtimeSourcePath(options)}/runs/${encodeURIComponent(instanceID)}/cancel` });
export const submitApplicationWorkflowInputAPI = ({ instanceID, collectionRequestID, submittedData, ...options }) =>
  request({ ...options, method: "post", data: { submittedData }, path: `${runtimeSourcePath(options)}/runs/${encodeURIComponent(instanceID)}/requests/${encodeURIComponent(collectionRequestID)}/submit` });
export const getApplicationListenerEventsAPI = async options => {
  const response = await request({ ...options, path: `${runtimeSourcePath(options)}/events` });
  return response.subscription;
};
