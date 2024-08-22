import { LOCAL_CONSTANTS } from "../constants";
import { Job } from "../models/data/job";
import axiosInstance from "../utils/axiosInstance";

export const addJobAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.JOB.addJob(),
      data
    );
    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const updateJobAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.JOB.updateJob(),
      data
    );

    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data && response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getJobByIDAPI = async ({ pmJobID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.JOB.getJobByID({
        id: pmJobID,
      })
    );
    if (response.data && response.data.success == true) {
      return new Job(response.data.job);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteJobByIDAPI = async ({ pmJobID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.JOB.deleteJobByID({
        id: pmJobID,
      })
    );
    if (response.data && response.data.success == true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllJobAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.JOB.getAllJobs()
    );
    if (response.data && response.data.success == true) {
      return Job.toList(response.data.jobs);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getJobHistoryAPI = async ({ page = 1, pageSize = 20 }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.JOB.getJobHistory({ page, pageSize })
    );
    if (response.data && response.data.success == true) {
      if (response.data.jobHistory && Array.isArray(response.data.jobHistory)) {
        return {
          jobHistory: response.data.jobHistory,
          nextPage: response.data.nextPage,
        };
      } else {
        return { jobHistory: [], nextPage: null };
      }
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
