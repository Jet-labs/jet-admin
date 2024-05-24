import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";
export const fetchAllRowsAPI = async ({
  tableName,
  page = 1,
  filterQuery,
  sortModel,
}) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTableRows({
        tableName,
        page,
        filterQuery,
        sortModel,
      })
    );
    if (response.data && response.data.success == true) {
      if (response.data.rows && Array.isArray(response.data.rows)) {
        return {
          rows: response.data.rows,
          nextPage: response.data.nextPage,
        };
      } else {
        return { rows: [], nextPage: null };
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

export const fetchTableStatsAPI = async ({ tableName, filterQuery }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTableStats({
        tableName,

        filterQuery,
      })
    );
    if (response.data && response.data.success == true) {
      if (response.data.statistics) {
        return {
          statistics: response.data.statistics,
        };
      } else {
        return { statistics: null };
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

export const fetchRowByIDAPI = async ({ tableName, id }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTableRowByID({
        tableName,
        id,
      })
    );
    if (response.data && response.data.success == true) {
      return response.data.row;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
