import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { Logger } from "../../utils/logger.js";

export const s3TestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "s3:s3TestConnection:params",
      params: { region: datasourceOptions.region },
    });

    const config = {
      region: datasourceOptions.region || "us-east-1",
      credentials: {
        accessKeyId: datasourceOptions.accessKeyId,
        secretAccessKey: datasourceOptions.secretAccessKey,
      },
    };

    if (datasourceOptions.endpoint) {
      config.endpoint = datasourceOptions.endpoint;
      config.forcePathStyle = true;
    }

    const client = new S3Client(config);
    
    // Test connection by listing buckets
    const command = new ListBucketsCommand({});
    await client.send(command);

    Logger.log("info", {
      message: "s3:s3TestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "s3:s3TestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
