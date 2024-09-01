import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";
import { triggerDownload } from "../utils/downloads";

export const getAllTableColumns = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getAllTableColumns()
    );
    if (response.data && response.data.success == true) {
      return response.data.allColumns;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getAllTables = async () => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getAllTables()
    );
    if (response.data && response.data.success == true) {
      return response.data.tables;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getTableColumns = async ({ tableName }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTableColumns({
        tableName,
      })
    );
    if (response.data && response.data.success == true) {
      return Array.from(response.data.columns);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const getTablePrimaryKey = async ({ tableName }) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTablePrimaryKey({
        tableName,
      })
    );
    if (response.data && response.data.success == true) {
      return Array.from(response.data.primaryKey);
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

export const fetchAllRowsAPI = async ({
  tableName,
  page = 1,
  pageSize = 20,
  filterQuery,
  sortModel,
}) => {
  try {
    const response = await axiosInstance.get(
      LOCAL_CONSTANTS.APIS.TABLE.getTableRows({
        tableName,
        page,
        pageSize,
        filterQuery,
        order: sortModel,
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
export const updateRowAPI = async ({ tableName, id, data }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.TABLE.updateTableRowByID({
        tableName,
        id,
      }),
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

export const addRowAPI = async ({ tableName, data }) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.TABLE.addTableRowByID({
        tableName,
      }),
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

export const deleteRowByIDAPI = async ({ tableName, id }) => {
  try {
    const response = await axiosInstance.delete(
      LOCAL_CONSTANTS.APIS.TABLE.deleteTableRowByID({
        tableName,
        id,
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

export const deleteRowByMultipleIDsAPI = async ({
  tableName,
  selectedRowIDs,
}) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.TABLE.deleteTableRowByMultipleIDs({
        tableName,
      }),
      { query: selectedRowIDs }
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

export const exportRowByMultipleIDsAPI = async ({
  tableName,
  selectedRowIDs,
  format,
}) => {
  try {
    const response = await axiosInstance.post(
      LOCAL_CONSTANTS.APIS.TABLE.exportTableRowByMultipleIDs({
        tableName,
      }),
      { query: selectedRowIDs, format },
      { responseType: "blob" }
    );
    if (response && response.data) {
      let blob;
      if (format === "json") {
        // Create a FileReader to read the Blob as text
        const reader = new FileReader();
        reader.onloadend = function () {
          const jsonText = reader.result;
          blob = new Blob([jsonText], { type: "application/json" });
          triggerDownload(blob, `data.${format}`);
        };
        reader.readAsText(response.data);
      } else {
        blob = new Blob([response.data]);
        triggerDownload(blob, `data.${format}`);
      }
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

