import { CONSTANTS } from "@/constants";
import { operatorClient } from "@/data/http/operatorClient";
import { useAdminStore } from "@/logic/stores/useAdminStore";

const _authHeaders = () => {
  const token = useAdminStore.getState().operatorToken;
  if (!token) throw new Error("Not signed in.");
  return { Authorization: `Bearer ${token}` };
};

export const operatorLoginAPI = async ({ email, password }) => {
  const response = await operatorClient.post(
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_AUTH.login(),
    { email, password }
  );
  if (response.data && response.data.success === true) {
    return response.data; // { operator, token, expiresAt }
  }
  throw response.data?.error || new Error("Login failed.");
};

export const operatorLogoutAPI = async () => {
  const response = await operatorClient.post(
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_AUTH.logout(),
    {},
    { headers: _authHeaders() }
  );
  return response.data?.success === true;
};

export const getOperatorMeAPI = async () => {
  const response = await operatorClient.get(
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.OPERATOR_AUTH.me(),
    { headers: _authHeaders() }
  );
  if (response.data && response.data.success === true) {
    return response.data.operator;
  }
  throw response.data?.error || new Error("Session check failed.");
};
