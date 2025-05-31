import fetch from "node-fetch";
import { URL, URLSearchParams } from "url";
import { Agent as HttpsAgent } from "https";
import { Agent as HttpAgent } from "http";
import { Logger } from "../../utils/logger";

export const restAPITestConnection = async ({ datasourceOptions }) => {
  const {
    baseUrl,
    method,
    timeout,
    authType,
    username,
    password,
    bearerToken,
    oauth2,
    headers = [],
    queryParams = [],
    body,
    contentType,
    followRedirects,
    sslVerify,
  } = datasourceOptions;

  try {
    Logger.log("info", {
      message: "restapi:restAPITestConnection:params",
      params: datasourceOptions,
    });

    // Build URL + query params
    const urlObj = new URL(baseUrl.trim());
    queryParams.forEach(({ key, value }) => {
      if (key) urlObj.searchParams.append(key, value);
    });

    // Prepare headers
    const hdrs = {};
    headers.forEach(({ key, value }) => {
      if (key) hdrs[key] = value;
    });
    if (contentType) hdrs["Content-Type"] = contentType;

    // Auth header
    if (authType === "basic" && username && password) {
      hdrs["Authorization"] =
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    } else if (authType === "bearer" && bearerToken) {
      hdrs["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "oauth2" && oauth2?.tokenUrl) {
      // Fetch OAuth2 token
      const tokenUrl = new URL(oauth2.tokenUrl);
      const tokenAgent =
        tokenUrl.protocol === "https:"
          ? new HttpsAgent({ rejectUnauthorized: sslVerify })
          : new HttpAgent({ rejectUnauthorized: sslVerify });

      const tokenRes = await fetch(tokenUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: oauth2.clientId,
          client_secret: oauth2.clientSecret,
        }),
        redirect: followRedirects ? "follow" : "manual",
        agent: tokenAgent,
        timeout: timeout * 1000,
      });
      const tokenJson = await tokenRes.json();
      if (tokenJson.access_token) {
        hdrs["Authorization"] = `Bearer ${tokenJson.access_token}`;
      }
    }

    // Choose proper agent
    const mainAgent =
      urlObj.protocol === "https:"
        ? new HttpsAgent({ rejectUnauthorized: sslVerify })
        : new HttpAgent({ rejectUnauthorized: sslVerify });

    // Fetch options
    const opts = {
      method,
      headers: hdrs,
      redirect: followRedirects ? "follow" : "manual",
      agent: mainAgent,
      timeout: timeout * 1000,
    };
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) &&
      body != null
    ) {
      opts.body = body;
    }

    // Execute request
    const res = await fetch(urlObj.toString(), opts);
    const contentTypeHeader = res.headers.get("content-type") || "";
    let parsedBody;
    if (contentTypeHeader.includes("application/json")) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }

    Logger.log("info", {
      message: "restapi:restAPITestConnection:response",
      params: {
        status: res.status,
        statusText: res.statusText,
        body: parsedBody,
      },
    });

    // Return both status and parsed body
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      body: parsedBody,
    };
  } catch (err) {
    Logger.log("error", {
      message: "restapi:restAPITestConnection:catch",
      params: err.message || err,
    });
    return {
      ok: false,
      error: err.message || err,
    };
  }
};
