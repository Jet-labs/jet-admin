import axios from "axios";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";
import { CronJob } from "../models/cronjob";
import { CronJobHistory } from "../models/cronJobHistory";

export const getAllCronJobsAPI = async ({ tenantID}) => {
    try {
        const url =
            CONSTANTS.SERVER_HOST +
            CONSTANTS.APIS.CRON_JOB.getAllCronJobsAPI(tenantID);
        const bearerToken = await firebaseAuth.currentUser.getIdToken();
        if (bearerToken) {
            const response = await axios.get(url, {
                headers: {
                    authorization: `Bearer ${bearerToken}`,
                },
            });
            if (response.data && response.data.success === true) {
                return CronJob.toList(response.data.cronJobs);
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

export const getCronJobByIDAPI = async ({ tenantID, jobID }) => {
    try {
        const url =
            CONSTANTS.SERVER_HOST +
            CONSTANTS.APIS.CRON_JOB.getCronJobByIDAPI(tenantID, jobID);
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

export const updateCronJobAPI = async ({ tenantID, jobID, cronJobData }) => {
    try {
        const url =
            CONSTANTS.SERVER_HOST +
            CONSTANTS.APIS.CRON_JOB.updateCronJobByIDAPI(tenantID, jobID);
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

export const deleteCronJobByIDAPI = async ({ tenantID, jobID }) => {
    try {
        const url =
            CONSTANTS.SERVER_HOST +
            CONSTANTS.APIS.CRON_JOB.deleteCronJobByIDAPI(tenantID, jobID);
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

export const getCronJobHistoryAPI = async ({ tenantID, jobID, page, pageSize }) => {
    try {
        const url =
            CONSTANTS.SERVER_HOST +
            CONSTANTS.APIS.CRON_JOB.getCronJobByIDAPI(tenantID, jobID, page, pageSize);
        const bearerToken = await firebaseAuth.currentUser.getIdToken();
        if (bearerToken) {
            const response = await axios.get(url, {
                headers: {
                    authorization: `Bearer ${bearerToken}`,
                },
            });
            if (response.data && response.data.success === true) {
                return {
                    cronJobHistory: CronJobHistory.toList(response.data.cronJobs),
                    nextPage: response.data.nextPage,
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
