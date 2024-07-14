import axios from "axios";
import { LOCAL_CONSTANTS } from "../constants";
import { refreshAccessToken } from "../api/auth";

const axiosInstance = axios.create({
  baseURL: LOCAL_CONSTANTS.SERVER_HOST,
  withCredentials: true,
});
// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await localStorage.getItem(
      LOCAL_CONSTANTS.STRINGS.ACCESS_TOKEN_LOCAL_STORAGE
    );
    config.headers.authorization = `Bearer ${accessToken}`;
    console.log({ config });
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  async (response) => {
    console.log({ response });
    if (
      response &&
      response.data &&
      response.data.error &&
      response.data.error.code ==
        LOCAL_CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED.code
    ) {
      try {
        const newAccessToken = await refreshAccessToken();
        localStorage.setItem(
          LOCAL_CONSTANTS.STRINGS.ACCESS_TOKEN_LOCAL_STORAGE,
          newAccessToken
        );
        // Update the request headers with the new access token
        response.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        // Retry the original request
        return axiosInstance(response.config);
      } catch (refreshError) {
        // Handle token refresh error
        throw refreshError;
      }
    } else {
      return response;
    }
  },
  async (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
