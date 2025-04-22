/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import { DatabaseTable } from "../models/databaseTable";
import { triggerDownload } from "../../utils/axios";

export const getAllDatabaseTablesAPI = async ({
  tenantID,
  databaseSchemaName,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getAllDatabaseTablesAPI(
        tenantID,
        databaseSchemaName
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return DatabaseTable.toList(response.data.databaseTables);
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

export const createDatabaseTableAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.createDatabaseTableAPI(
        tenantID,
        databaseSchemaName
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { ...databaseTableData },
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

export const updateDatabaseTableByNameAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.updateDatabaseTableByNameAPI(
        tenantID,
        databaseSchemaName,
        databaseTableName
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        { ...databaseTableData },
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

export const deleteDatabaseTableByNameAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.deleteDatabaseTableByNameAPI(
        tenantID,
        databaseSchemaName,
        databaseTableName
      );
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

export const getDatabaseTableByNameAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getDatabaseTableByNameAPI(
        tenantID,
        databaseSchemaName,
        databaseTableName
      );
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        return new DatabaseTable(response.data.databaseTable);
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        console.log(response.data);
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error;
  }
};

export const getDatabaseTableRowsAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  page = 1,
  pageSize = 20,
  filterQuery,
  databaseTableColumnSortModel,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getDatabaseTableRowsAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        page,
        pageSize,
        filterQuery,
        databaseTableColumnSortModel: databaseTableColumnSortModel,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        if (
          response.data.databaseTableRows &&
          Array.isArray(response.data.databaseTableRows)
        ) {
          return {
            rows: response.data.databaseTableRows,
            nextPage: response.data.nextPage,
          };
        } else {
          return { rows: [], nextPage: null };
        }
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

export const getDatabaseTableStatisticsAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  filterQuery,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.getDatabaseTableStatisticsAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        filterQuery,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${bearerToken}`,
        },
      });
      if (response.data && response.data.success === true) {
        if (response.data.databaseTableStatistics) {
          return response.data.databaseTableStatistics;
        } else {
          return null;
        }
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

export const databaseTableBulkRowAdditionAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableRowData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.databaseTableBulkRowAdditionAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.post(
        url,
        { databaseTableRowData },
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

export const databaseTableBulkRowUpdationAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTableRowData,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.databaseTableBulkRowUpdationAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        { databaseTableRowData },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.data && response.data.success) {
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

export const databaseTableBulkRowDeletionAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  query,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.databaseTableBulkRowDeletionAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        { query },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.data && response.data.success) {
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

export const databaseTableBulkRowExportAPI = async ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  query,
  exportFormat,
}) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.DATABASE.databaseTableBulkRowExportAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
      });
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (bearerToken) {
      const response = await axios.patch(
        url,
        { query, exportFormat },
        {
          responseType: "blob",
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.data) {
        let blob;
        if (exportFormat === "json") {
          // Create a FileReader to read the Blob as text
          const reader = new FileReader();
          reader.onloadend = function () {
            const jsonText = reader.result;
            blob = new Blob([jsonText], { type: "application/json" });
            triggerDownload(blob, `data.${exportFormat}`);
          };
          reader.readAsText(response.data);
        } else {
          blob = new Blob([response.data]);
          triggerDownload(blob, `data.${exportFormat}`);
        }
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
