/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { Widget } from "../models/widget";

export const getAllWidgetsAPI = async ({ tenantID, search, page, pageSize, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getAllWidgetsAPI(tenantID);
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
        const widgetsList = response.data.widgets ? Widget.toList(response.data.widgets) : [];
        if (response.data.totalCount !== undefined) {
          return {
            widgets: widgetsList,
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            page: response.data.page,
            pageSize: response.data.pageSize,
          };
        }
        return widgetsList;
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

export const getWidgetByIDAPI = async ({ tenantID, widgetID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getWidgetByIDAPI(tenantID, widgetID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new Widget(response.data.widget);
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

export const createWidgetAPI = async ({ tenantID, widgetData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST + CONSTANTS.APIS.DATABASE.createWidgetAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          ...widgetData,
        },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (response.data && response.data.success === true) {
        return new Widget(response.data.widget);
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

export const cloneWidgetByIDAPI = async ({ tenantID, widgetID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.cloneWidgetByIDAPI(tenantID, widgetID);
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

export const updateWidgetByIDAPI = async ({
  tenantID,
  widgetID,
  widgetData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.updateWidgetByIDAPI(tenantID, widgetID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        {
          widgetID,
          ...widgetData,
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

export const deleteWidgetByIDAPI = async ({ tenantID, widgetID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.deleteWidgetByID(tenantID, widgetID);
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

export const uploadWidgetFileAPI = async ({ tenantID, file }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.uploadWidgetFileAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(url, formData, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success === true) {
        return {
          url: response.data.url,
          filePath: response.data.filePath,
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
          fileType: response.data.fileType,
        };
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
