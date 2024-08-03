import { LOCAL_CONSTANTS } from "../constants";
import axiosInstance from "../utils/axiosInstance";

export const runSchemaQueryAPI = async ({ schemaQuery }) => {
  try {
    const response = await axiosInstance.put(
      LOCAL_CONSTANTS.APIS.SCHEMA.runSchemaQuery(),
      { schema_query: schemaQuery }
    );
    if (response.data && response.data.success == true) {
      console.log({ response: response.data.result });
      return response.data.result;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw LOCAL_CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
