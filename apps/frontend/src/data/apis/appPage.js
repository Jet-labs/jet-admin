/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { AppPage } from "../models/appPage";

export const getAllAppPagesAPI = async ({ tenantID, search, page, pageSize, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getAllAppPagesAPI(tenantID);
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
        const appPagesList = response.data.appPages ? AppPage.toList(response.data.appPages) : [];
        if (response.data.totalCount !== undefined) {
          return {
            appPages: appPagesList,
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            page: response.data.page,
            pageSize: response.data.pageSize,
          };
        }
        return appPagesList;
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

export const getAppPageByIDAPI = async ({ tenantID, appPageID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getAppPageByIDAPI(tenantID, appPageID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new AppPage(response.data.appPage);
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

export const createAppPageAPI = async ({ tenantID, appPageData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.createAppPageAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          ...appPageData,
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

export const cloneAppPageByIDAPI = async ({ tenantID, appPageID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.cloneAppPageByIDAPI(tenantID, appPageID);
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

export const updateAppPageByIDAPI = async ({
  tenantID,
  appPageID,
  appPageData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.updateAppPageByIDAPI(tenantID, appPageID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        {
          appPageID,
          ...appPageData,
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

export const deleteAppPageByIDAPI = async ({ tenantID, appPageID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.deleteAppPageByID(tenantID, appPageID);
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
