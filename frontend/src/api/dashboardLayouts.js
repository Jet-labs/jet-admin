import { LOCAL_CONSTANTS } from "../constants";
import { DashboardLayout } from "../models/data/dashboardLayout";
import axiosInstance from "../utils/axiosInstance";

export const addDashboardLayoutAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.DASHBOARD_LAYOUT.addDashboardLayout(),
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

export const updateDashboardLayoutAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.DASHBOARD_LAYOUT.updateDashboardLayout(),
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

export const getDashboardLayoutByIDAPI = async ({ graphID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.DASHBOARD_LAYOUT.getDashboardLayoutByID({
        id: graphID,
      })
    );
    if (response.data && response.data.success == true) {
      return new DashboardLayout(response.data.dashboardLayout);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllDashboardLayoutAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.DASHBOARD_LAYOUT.getAllDashboardLayouts()
    );
    if (response.data && response.data.success == true) {
      return DashboardLayout.toList(response.data.dashboardLayouts);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
