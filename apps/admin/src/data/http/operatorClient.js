import axios from "axios";
import { useAdminStore } from "@/logic/stores/useAdminStore";

/**
 * Axios client for the operator control-plane (/api/v1/operator/*).
 *
 * A 401 anywhere means the operator session expired or was revoked — clear
 * the local session so ProtectedLayout bounces to /login automatically.
 */
export const operatorClient = axios.create();

operatorClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAdminStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);
