import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class S3DataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "s3:S3DataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      operation,
      bucket,
      prefix,
      key,
      body,
      contentType,
      maxKeys,
      responseType,
    } = dataQueryOptions;

    const datasourceOptions = this.config.datasourceOptions;
    const targetBucket = bucket || datasourceOptions.bucket;

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

    try {
      let result;

      switch (operation) {
        case "listObjects": {
          const command = new ListObjectsV2Command({
            Bucket: targetBucket,
            Prefix: prefix || "",
            MaxKeys: maxKeys || 1000,
          });
          const response = await client.send(command);
          result = {
            contents: response.Contents || [],
            isTruncated: response.IsTruncated,
            keyCount: response.KeyCount,
          };
          break;
        }

        case "getObject": {
          const command = new GetObjectCommand({
            Bucket: targetBucket,
            Key: key,
          });
          const response = await client.send(command);
          
          // Convert stream to string/buffer based on responseType
          const streamToString = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
          };

          const bodyBuffer = await streamToString(response.Body);
          
          if (responseType === "json") {
            result = JSON.parse(bodyBuffer.toString("utf-8"));
          } else if (responseType === "base64") {
            result = bodyBuffer.toString("base64");
          } else {
            result = bodyBuffer.toString("utf-8");
          }
          break;
        }

        case "putObject": {
          const command = new PutObjectCommand({
            Bucket: targetBucket,
            Key: key,
            Body: body,
            ContentType: contentType || "application/octet-stream",
          });
          await client.send(command);
          result = { success: true, key };
          break;
        }

        case "deleteObject": {
          const command = new DeleteObjectCommand({
            Bucket: targetBucket,
            Key: key,
          });
          await client.send(command);
          result = { success: true, deleted: key };
          break;
        }

        case "headObject": {
          const command = new HeadObjectCommand({
            Bucket: targetBucket,
            Key: key,
          });
          const response = await client.send(command);
          result = {
            contentLength: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
            eTag: response.ETag,
            metadata: response.Metadata,
          };
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      Logger.log("info", {
        message: "s3:S3DataSource:execute:success",
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "s3:S3DataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`S3 operation failed: ${error.message || error}`);
    }
  }
}
