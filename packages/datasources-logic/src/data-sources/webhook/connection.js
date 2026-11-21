import { normalizeAllowedMethods } from "./methods.js";

export const webhookTestConnection = async ({ datasourceOptions }) => {
  const options = datasourceOptions || {};
  const methods = normalizeAllowedMethods(options.allowedMethods);
  const pathSuffix = String(options.pathSuffix || "").replace(/^\//, "").trim();
  if (pathSuffix && !/^[A-Za-z0-9._~!$&'()*+,;=:@/-]+$/.test(pathSuffix)) {
    return { ok: false, error: "Webhook path suffix contains invalid URL characters." };
  }
  if (methods.length === 0) {
    return { ok: false, error: "At least one allowed HTTP method is required." };
  }
  // Webhook ingress is passive: there is no outbound endpoint to dial. A valid
  // method/path configuration is the meaningful test; the route is registered
  // when the listener starts.
  return {
    ok: true,
    success: true,
    status: 200,
    statusText: "Ingress configuration valid (passive)",
    passive: true,
  };
};
