export default function getWebhookGuidance({
  tenantID,
  listenerID,
  listenerConfig = {},
  datasourceOptions = {},
  baseUrl = "http://localhost:8095",
}) {
  const options = { ...datasourceOptions, ...listenerConfig };
  const pathSuffix = (listenerConfig.pathSuffix || "").replace(/^\//, "");
  const effectiveSuffix = pathSuffix || "your-path-suffix";
  const allowedMethod = (options.allowedMethods || "POST").toUpperCase();
  const authType = options.authType || "none";

  const pathSuffixUrl = `${baseUrl}/webhooks/v1/inbound/${tenantID}/${effectiveSuffix}`;
  const listenerIdUrl = listenerID
    ? `${baseUrl}/webhooks/v1/inbound/${listenerID}`
    : `${baseUrl}/webhooks/v1/inbound/<listenerID>`;

  let authHeaderSnippet = "";
  let authQueryStr = "";
  let authDescription = "Public (No Auth required)";

  if (authType === "basic") {
    const user = options.username || "username";
    const pass = options.password || "password";
    authHeaderSnippet = ` -u "${user}:${pass}" \\`;
    authDescription = `Basic Auth (User: '${user}')`;
  } else if (authType === "bearer") {
    const token = options.bearerToken || "YOUR_BEARER_TOKEN";
    authHeaderSnippet = ` -H "Authorization: Bearer ${token}" \\`;
    authDescription = `Bearer Token ('${token}')`;
  } else if (authType === "header") {
    const headerName = options.authHeaderName || "x-api-key";
    const secret = options.authSecret || "YOUR_SECRET_KEY";
    authHeaderSnippet = ` -H "${headerName}: ${secret}" \\`;
    authDescription = `Header '${headerName}'`;
  } else if (authType === "query_param") {
    const paramName = options.authHeaderName || "api_key";
    const secret = options.authSecret || "YOUR_SECRET_KEY";
    authQueryStr = `?${paramName}=${encodeURIComponent(secret)}`;
    authDescription = `Query Param '?${paramName}=...'`;
  }

  const curlSnippet = `curl -X ${allowedMethod} "${pathSuffixUrl}${authQueryStr}" \\${authHeaderSnippet ? `\n ${authHeaderSnippet}` : ""}
  -H "Content-Type: application/json" \\
  -d '{"event": "payment_success", "amount": 100}'`;

  return {
    title: "Webhook Ingestion Guidance",
    summary: "Ingests HTTP POST, PUT, or GET requests sent to Jet Admin's dedicated Webhook Receiver service on port 8095.",
    badges: [
      { label: `Method: ${allowedMethod}`, color: "neutral" },
      { label: `Auth: ${authDescription}`, color: authType === "none" ? "neutral" : "emerald" },
      { label: "Port: 8095", color: "emerald" },
    ],
    urls: [
      {
        label: "Custom Path Suffix Endpoint URL",
        url: pathSuffixUrl,
        description: "Use this URL in third-party webhooks (Stripe, GitHub, Shopify)",
      },
      {
        label: "Direct Listener ID Endpoint URL (Fallback)",
        url: listenerIdUrl,
        description: "Direct reference by unique listener UUID",
      },
    ],
    snippets: [
      {
        label: "Real-time cURL Request Command",
        language: "bash",
        code: curlSnippet,
      },
    ],
    instructions: "Point third-party webhooks or HTTP clients to the copyable URL above.",
  };
}
