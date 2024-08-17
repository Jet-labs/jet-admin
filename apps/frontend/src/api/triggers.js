import { LOCAL_CONSTANTS } from "../constants";
import { Trigger } from "../models/data/trigger";
import axiosInstance from "../utils/axiosInstance";

export const addTriggerAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.TRIGGER.addTrigger(),
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

export const getTriggerByIDAPI = async ({ pmTriggerID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TRIGGER.getTriggerByID({
        id: pmTriggerID,
      })
    );
    if (response.data && response.data.success == true) {
      return new Trigger(response.data.trigger);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteTriggerByIDAPI = async ({ pmTriggerID }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.TRIGGER.deleteTriggerByID({
        id: pmTriggerID,
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

export const getAllTriggerAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TRIGGER.getAllTriggers()
    );
    if (response.data && response.data.success == true) {
      console.log(response.data);
      return Trigger.toList(response.data.triggers);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
