import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";
import { Policy } from "../models/data/policy";

export const addPolicyAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.POLICIES.addPolicy(),
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

export const updatePolicyAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.POLICIES.updatePolicy(),
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
    console.log({ error });
    throw error;
  }
};

export const getPolicyByIDAPI = async ({ pmPolicyObjectID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.POLICIES.getPolicyByID({
        id: pmPolicyObjectID,
      })
    );
    if (response.data && response.data.success == true) {
      return new Policy(response.data.policy);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deletePolicyByIDAPI = async ({ pmPolicyObjectID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.POLICIES.deletePolicyByID({
        id: pmPolicyObjectID,
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

export const getAllPoliciesAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.POLICIES.getAllPolicies()
    );
    if (response.data && response.data.success == true) {
      const policies = Policy.toList(response.data.policies);
      console.log({ policies });
      return policies;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    console.log({ error });
    throw error;
  }
};
