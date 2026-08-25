/* eslint-disable no-useless-catch */
import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";
import { CronJob } from "../models/cronJob";
import { CronJobHistory } from "../models/cronJobHistory";

export const getAllCronJobsAPI = async ({ tenantID, search, page, pageSize, folderID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.getAllCronJobsAPI(tenantID);
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
        const cronJobsList = response.data.cronJobs ? CronJob.toList(response.data.cronJobs) : [];
        if (response.data.totalCount !== undefined) {
          return {
            cronJobs: cronJobsList,
            totalCount: response.data.totalCount,
            totalPages: response.data.totalPages,
            page: response.data.page,
            pageSize: response.data.pageSize,
          };
        }
        return cronJobsList;
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

export const createCronJobAPI = async ({ tenantID, cronJobData }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.createCronJobAPI(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        {
          ...cronJobData,
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

export const getCronJobByIDAPI = async ({ tenantID, cronJobID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.getCronJobByIDAPI(tenantID, cronJobID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new CronJob(response.data.cronJob);
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

export const updateCronJobAPI = async ({
  tenantID,
  cronJobID,
  cronJobData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.updateCronJobByIDAPI(tenantID, cronJobID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        {
          ...cronJobData,
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

export const deleteCronJobByIDAPI = async ({ tenantID, cronJobID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.deleteCronJobByIDAPI(tenantID, cronJobID);
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

export const cloneCronJobAPI = async ({ tenantID, cronJobID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.cloneCronJobAPI(tenantID, cronJobID);
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

export const getCronJobHistoryAPI = async ({
  tenantID,
  cronJobID,
  page,
  pageSize,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.getCronJobHistoryByIDAPI(
        tenantID,
        cronJobID,
        page,
        pageSize
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return {
          cronJobHistory: CronJobHistory.toList(response.data.cronJobHistory),
          nextPage: response.data.nextPage,
          cronJobHistoryCount: response.data.cronJobHistoryCount,
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

export const getCronJobConnectionStatusAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.CRON_JOB.getConnectionStatusAPI(tenantID);
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

