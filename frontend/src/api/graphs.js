import { LOCAL_CONSTANTS } from "../constants";
import { Graph } from "../models/data/graph";
import axiosInstance from "../utils/axiosInstance";

export const addGraphAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.GRAPH.addGraph(),
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

export const updateGraphAPI = async ({ data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.GRAPH.updateGraph(),
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

export const getGraphDataByIDAPI = async ({ graphID }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.GRAPH.getGraphDataByID({ id: graphID })
    );
    if (response.data && response.data.success == true) {
      return new Graph(response.data.graph);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllGraphAPI = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.GRAPH.getAllGraphs()
    );
    if (response.data && response.data.success == true) {
      return Graph.toList(response.data.graphs);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
