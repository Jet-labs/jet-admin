/**
 * fileStorage.util.js
 *
 * Singleton utility for all file I/O operations (upload, download, existence
 * check) against S3-compatible object storage (AWS S3, MinIO, RustFS, or any
 * S3-compatible backend) via @aws-sdk/client-s3, plus plain public HTTP URLs.
 *
 * Configure via the S3_* environment variables (see environment.js).
 */

const environmentVariables = require("../environment");
const axios = require("axios");
const { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const constants = require("../constants");

class FileStorageUtil {
  constructor() {
    // Singleton guard
    if (FileStorageUtil._instance) {
      return FileStorageUtil._instance;
    }

    this._s3Client = null;

    FileStorageUtil._instance = this;
  }

  // ── Environment detection ──────────────────────────────────────────────────

  /** True when S3-compatible credentials are fully configured. */
  get useS3() {
    const key = environmentVariables.S3_ACCESS_KEY_ID;
    const endpoint = environmentVariables.S3_ENDPOINT;
    return Boolean(
      key && key !== "will add manually" &&
      endpoint && endpoint !== "will add manually"
    );
  }

  /** Throws when storage is used without S3 configuration. */
  assertS3Configured() {
    if (!this.useS3) {
      throw new Error(
        "Object storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID and " +
        "S3_SECRET_ACCESS_KEY (see .env.docker) or start the bundled RustFS: " +
        "`docker compose --profile storage up -d`."
      );
    }
  }

  /** Default bucket for uploads (explicit bucket, else built-in default). */
  getDefaultBucket() {
    return environmentVariables.S3_BUCKET || constants.STORAGE.BUCKETS.DATASOURCE_FILE_UPLOADS;
  }

  /** Browser-facing base URL for public file URLs (no trailing slash). */
  getPublicBaseUrl() {
    return (environmentVariables.S3_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  }

  // ── Client accessors (lazy singletons) ────────────────────────────────────

  /**
   * Returns a cached S3Client, creating it on first call.
   * Works against AWS S3, MinIO, RustFS, or any S3-compatible endpoint
   * via S3_ENDPOINT / S3_REGION / credentials.
   * @returns {S3Client}
   */
  getS3Client() {
    if (!this._s3Client) {
      this._s3Client = new S3Client({
        endpoint: environmentVariables.S3_ENDPOINT,
        region: environmentVariables.S3_REGION || "us-east-1",
        credentials: {
          accessKeyId: environmentVariables.S3_ACCESS_KEY_ID,
          secretAccessKey: environmentVariables.S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: environmentVariables.S3_FORCE_PATH_STYLE !== "false",
      });
    }
    return this._s3Client;
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  /**
   * Returns true if the URL was built from our S3_PUBLIC_BASE_URL
   * (`<base>/<bucket>/<key>` path style), so S3 strategies apply
   * instead of a plain HTTP fetch.
   * @param {string} fileUrl
   */
  isS3PublicUrl(fileUrl) {
    const base = this.getPublicBaseUrl();
    return typeof fileUrl === "string" && Boolean(base) && fileUrl.startsWith(`${base}/`);
  }

  /**
   * Splits a `<base>/<bucket>/<key>` storage URL into its bucket and
   * file-path parts.
   * @param {string} fileUrl
   * @returns {{ bucketName: string, filePath: string }}
   * @throws {Error} if the URL is malformed
   */
  _extractBucketAndPath(fileUrl) {
    const base = this.getPublicBaseUrl();
    if (!base || !fileUrl.startsWith(`${base}/`)) {
      throw new Error(`Malformed storage URL — cannot extract bucket/path: ${fileUrl}`);
    }
    const bucketAndPath = fileUrl.substring(base.length + 1);
    const slashIdx = bucketAndPath.indexOf("/");
    if (slashIdx === -1) {
      throw new Error(`Storage URL has no file path after the bucket name: ${fileUrl}`);
    }
    return {
      bucketName: bucketAndPath.substring(0, slashIdx),
      filePath: bucketAndPath.substring(slashIdx + 1),
    };
  }

  /**
   * Builds the public URL for an uploaded object
   * (`<S3_PUBLIC_BASE_URL>/<bucket>/<key>`).
   * @param {string} bucketName
   * @param {string} filePath
   */
  buildPublicUrl(bucketName, filePath) {
    const base = this.getPublicBaseUrl();
    if (!base) {
      throw new Error(
        "S3_PUBLIC_BASE_URL is required to construct the public file URL after S3 upload."
      );
    }
    return `${base}/${bucketName}/${filePath}`;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Downloads a file as a Node.js Buffer using the best available strategy:
   *   1. S3-compatible API (when S3 credentials are configured)
   *   2. Plain axios GET  (public URL / any other host)
   *
   * @param {string} fileUrl
   * @returns {Promise<Buffer>}
   */
  async getFileBuffer(fileUrl) {
    if (this.isS3PublicUrl(fileUrl) && this.useS3) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const s3 = this.getS3Client();
      const res = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: filePath }));
      const byteArray = await res.Body.transformToByteArray();
      return Buffer.from(byteArray);
    }

    // Plain public URL
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }

  /**
   * Verifies that a file exists / is reachable without downloading the body.
   * Throws on failure so callers can decide how to surface the error.
   *
   * Strategy order:
   *   1. S3 HeadObject
   *   2. HTTP HEAD → byte-range GET fallback (for public URLs / CORS edge-cases)
   *
   * @param {string} fileUrl
   * @returns {Promise<true>}
   * @throws {Error}
   */
  async checkFileExists(fileUrl) {
    if (this.isS3PublicUrl(fileUrl) && this.useS3) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const s3 = this.getS3Client();
      await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: filePath }));
      return true;
    }

    // Plain public URL: try HEAD first, fall back to byte-range GET
    try {
      const res = await axios.head(fileUrl, { timeout: 5000 });
      if (res.status >= 200 && res.status < 300) return true;
      throw new Error(`HTTP HEAD returned status ${res.status}`);
    } catch (headErr) {
      // Some servers / CORS configs reject HEAD — try a lightweight byte-range GET
      const res = await axios.get(fileUrl, {
        headers: { Range: "bytes=0-0" },
        timeout: 5000,
      });
      if (res.status >= 200 && res.status < 300) return true;
      throw new Error(`HTTP GET (byte-range) returned status ${res.status}`);
    }
  }

  /**
   * Uploads a file buffer to S3-compatible storage and returns its public URL.
   *
   * @param {Buffer}  fileBuffer
   * @param {string}  mimetype   e.g. "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
   * @param {string}  filePath   Storage key / path within the bucket
   * @param {string}  [customBucket] Override the default bucket
   * @returns {Promise<string>}  Public URL of the uploaded file
   */
  async uploadFile(fileBuffer, mimetype, filePath, customBucket = null) {
    this.assertS3Configured();
    const bucketName = customBucket || this.getDefaultBucket();

    const s3 = this.getS3Client();
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: fileBuffer,
      ContentType: mimetype,
    }));

    return this.buildPublicUrl(bucketName, filePath);
  }
}

module.exports = new FileStorageUtil();
