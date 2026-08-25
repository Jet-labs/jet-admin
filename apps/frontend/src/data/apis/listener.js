/* eslint-disable no-useless-catch */
import { CONSTANTS } from "../../constants";
import axios from "axios";
import { Listener } from "../models/listener";
import { firebaseAuth } from "../../config/firebase";

const _getHeaders = async () => {
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
  return { Authorization: `Bearer ${bearerToken}` };
};

export const getAllListenersAPI = async ({ tenantID, search, page, pageSize, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.getAllListenersAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.get(url, {
      headers,
      params: {
        search,
        page,
        pageSize,
        folderID,
      },
    });
    if (response.data && response.data.success === true) {
      const listenersList = response.data.listeners ? Listener.toList(response.data.listeners) : [];
      if (response.data.totalCount !== undefined) {
        return {
          listeners: listenersList,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
          page: response.data.page,
          pageSize: response.data.pageSize,
        };
      }
      return listenersList;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getListenerByIDAPI = async ({ tenantID, listenerID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.getListenerByIDAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.get(url, { headers });
    if (response.data && response.data.success === true) {
      return new Listener(response.data.listener);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const createListenerAPI = async ({ tenantID, listenerData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.createListenerAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.post(url, listenerData, { headers });
    if (response.data && response.data.success === true) {
      return new Listener(response.data.listener);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const updateListenerAPI = async ({
  tenantID,
  listenerID,
  listenerData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.updateListenerAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.put(url, listenerData, { headers });
    if (response.data && response.data.success === true) {
      return new Listener(response.data.listener);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteListenerAPI = async ({ tenantID, listenerID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.deleteListenerAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.delete(url, { headers });
    if (response.data && response.data.success === true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const cloneListenerAPI = async ({ tenantID, listenerID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.cloneListenerAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.post(url, {}, { headers });
    if (response.data && response.data.success === true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const activateListenerAPI = async ({ tenantID, listenerID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.activateListenerAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.post(url, {}, { headers });
    if (response.data && response.data.success === true) {
      return new Listener(response.data.listener);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deactivateListenerAPI = async ({ tenantID, listenerID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.deactivateListenerAPI(tenantID, listenerID);
    const headers = await _getHeaders();
    const response = await axios.post(url, {}, { headers });
    if (response.data && response.data.success === true) {
      return new Listener(response.data.listener);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};



export const createListenerActionAPI = async ({ tenantID, listenerID, actionData }) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions`;
    const headers = await _getHeaders();
    const response = await axios.post(url, actionData, { headers });
    if (response.data && response.data.success === true) {
      return response.data.action;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const updateListenerActionAPI = async ({ tenantID, listenerID, actionID, actionData }) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions/${actionID}`;
    const headers = await _getHeaders();
    const response = await axios.put(url, actionData, { headers });
    if (response.data && response.data.success === true) {
      return response.data.action;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteListenerActionAPI = async ({ tenantID, listenerID, actionID }) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/listeners/${listenerID}/actions/${actionID}`;
    const headers = await _getHeaders();
    const response = await axios.delete(url, { headers });
    if (response.data && response.data.success === true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getListenerConnectionStatusAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.LISTENER.getConnectionStatusAPI(tenantID);
    const headers = await _getHeaders();
    const response = await axios.get(url, { headers });
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

