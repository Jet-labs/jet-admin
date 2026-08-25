/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { Workflow } from "../models/workflow";

export const getAllWorkflowsAPI = async ({ tenantID, search, page, pageSize, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getAllWorkflowsAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        params: {
          search,
          page,
          pageSize,
          folderID,
        },
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        const workflowsList = response.data.workflows ? Workflow.toList(response.data.workflows) : [];
        if (response.data.totalCount !== undefined) {
          return {
            workflows: workflowsList,
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            page: response.data.page,
            pageSize: response.data.pageSize,
          };
        }
        return workflowsList;
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

export const getWorkflowByIDAPI = async ({ tenantID, workflowID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getWorkflowByIDAPI(tenantID, workflowID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new Workflow(response.data.workflow);
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

export const createWorkflowAPI = async ({ tenantID, workflowData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.createWorkflowAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          ...workflowData,
        },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
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

export const updateWorkflowAPI = async ({
  tenantID,
  workflowID,
  workflowData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.updateWorkflowAPI(tenantID, workflowID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        {
          ...workflowData,
        },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
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

export const deleteWorkflowAPI = async ({ tenantID, workflowID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.deleteWorkflowAPI(tenantID, workflowID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.delete(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
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

export const cloneWorkflowAPI = async ({ tenantID, workflowID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.cloneWorkflowAPI(tenantID, workflowID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
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

/**
 * Execute a saved workflow by ID
 */
export const executeWorkflowAPI = async ({ tenantID, workflowID, inputValues = {} }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.executeWorkflowAPI(tenantID, workflowID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { inputValues },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * List workflow run history for a tenant, optionally scoped to one workflow.
 */
export const getWorkflowRunHistoryAPI = async ({
  tenantID,
  workflowID,
  status,
  page = 1,
  pageSize = 50,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getWorkflowRunHistoryAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        params: {
          ...(workflowID ? { workflowID } : {}),
          ...(status ? { status } : {}),
          page,
          pageSize,
        },
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Test run a workflow without saving (uses in-memory nodes/edges)
 */
export const testWorkflowAPI = async ({ tenantID, nodes, edges, inputValues = {} }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.testWorkflowAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { nodes, edges, inputValues },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return response.data;
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error?.response?.data?.error || error;
  }
};

/**
 * Get workflow run status
 */
export const getWorkflowRunStatusAPI = async ({ tenantID, instanceID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getWorkflowRunStatusAPI(tenantID, instanceID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Stop and delete a test workflow instance
 */
export const stopTestWorkflowAPI = async ({ tenantID, instanceID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.stopTestWorkflowAPI(tenantID, instanceID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.delete(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Get workflow run status with processed data for widget display
 * 
 * @param {object} params
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.instanceID - Workflow instance ID
 * @param {string} params.widgetType - Widget type (bar, line, pie, etc.)
 * @param {object} params.datasetFields - Field mappings
 * @param {object} params.parameters - Additional chart parameters
 * @returns {Promise<object>} Workflow status with processed data
 */
export const getWorkflowRunStatusForWidgetAPI = async ({
  tenantID,
  instanceID,
  widgetType,
  datasetFields,
  parameters
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getWorkflowRunStatusForWidgetAPI(tenantID, instanceID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { widgetType, datasetFields, parameters },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return response.data;
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

/**
 * Submit user-collected data to resume a suspended workflow node.
 *
 * @param {{ tenantID, collectionRequestID, submittedData }} params
 */
export const submitDataCollectionAPI = async ({ tenantID, collectionRequestID, submittedData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.submitDataCollectionAPI(tenantID, collectionRequestID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { submittedData },
        { headers: { authorization: `Bearer ${bearerToken}` } }
      );
      if (response.data?.success) return response.data;
      throw response.data?.error || CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
    throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  } catch (error) {
    throw error?.response?.data?.error || error;
  }
};

/**
 * Fetch a data-collection request (used on page-refresh to recover form state).
 *
 * @param {{ tenantID, collectionRequestID }} params
 */
export const getDataCollectionRequestAPI = async ({ tenantID, collectionRequestID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.WORKFLOW.getDataCollectionRequestAPI(tenantID, collectionRequestID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      if (response.data?.success) return response.data;
      throw response.data?.error || CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
    throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  } catch (error) {
    throw error;
  }
};