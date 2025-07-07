
import fetch from "node-fetch";
import { Agent as HttpsAgent } from "https";
import { Agent as HttpAgent } from "http";
import { Logger } from "../../utils/logger";

export const webURLTestConnection = async ({ datasourceOptions }) => {
  const { url, timeout } = datasourceOptions;
  try {
    Logger.log("info", {
      message: "weburl:webURLTestConnection:params",
      params: { url, timeout },
    });

    // Fetch options
    const opts = {
      method: "GET",
      headers: {},
      redirect: "follow",
      timeout: timeout,
    };

    // Execute request
    const res = await fetch(url, opts);
    const contentTypeHeader = res.headers.get("content-type") || "";
    let parsedBody;
    if (contentTypeHeader.includes("application/json")) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }

    Logger.log("info", {
      message: "weburl:webURLTestConnection:response",
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
      message: "weburl:webURLTestConnection:catch",
      params: err.message || err,
    });
    return {
      ok: false,
      error: err.message || err,
    };
  }
};
