/**
 * fileStorage.util.js
 *
 * Singleton utility for all file I/O operations (upload, download, existence
 * check) across S3-compatible Supabase storage, the Supabase JS client, and
 * plain public HTTP URLs.
 */

const environmentVariables = require("../environment");
const axios = require("axios");
const { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const SUPABASE_STORAGE_MARKER = "/storage/v1/object/public/";

class FileStorageUtil {
  constructor() {
    // Singleton guard
    if (FileStorageUtil._instance) {
      return FileStorageUtil._instance;
    }

    this._s3Client = null;
    this._supabaseClient = null;

    FileStorageUtil._instance = this;
  }

  // ── Environment detection ──────────────────────────────────────────────────

  /** True when S3-compatible credentials are fully configured. */
  get useS3() {
    const key = environmentVariables.SUPABASE_S3_ACCESS_KEY_ID;
    return Boolean(key && key !== "will add manually");
  }

  /** True when the Supabase JS client can be used (anon key present). */
  get useSupabaseClient() {
    return Boolean(environmentVariables.SUPABASE_ANON_KEY);
  }

  // ── Client accessors (lazy singletons) ────────────────────────────────────

  /**
   * Returns a cached S3Client, creating it on first call.
   * @returns {S3Client}
   */
  getS3Client() {
    if (!this._s3Client) {
      this._s3Client = new S3Client({
        endpoint: environmentVariables.SUPABASE_S3_ENDPOINT,
        region: environmentVariables.SUPABASE_S3_REGION,
        credentials: {
          accessKeyId: environmentVariables.SUPABASE_S3_ACCESS_KEY_ID,
          secretAccessKey: environmentVariables.SUPABASE_S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });
    }
    return this._s3Client;
  }

  /**
   * Returns a cached Supabase JS client, creating it on first call.
   * Still async because @supabase/supabase-js is ESM-only in newer versions.
   * @returns {Promise<import("@supabase/supabase-js").SupabaseClient>}
   */
  async getSupabaseClient() {
    if (!this._supabaseClient) {
      const { createClient } = await import("@supabase/supabase-js");
      this._supabaseClient = createClient(
        environmentVariables.SUPABASE_URL,
        environmentVariables.SUPABASE_ANON_KEY
      );
    }
    return this._supabaseClient;
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  /**
   * Returns true if the URL points at a Supabase public storage object.
   * @param {string} fileUrl
   */
  isSupabaseStorageUrl(fileUrl) {
    return typeof fileUrl === "string" && fileUrl.includes(SUPABASE_STORAGE_MARKER);
  }

  /**
   * Splits a Supabase public storage URL into its bucket and file-path parts.
   * @param {string} fileUrl
   * @returns {{ bucketName: string, filePath: string }}
   * @throws {Error} if the URL is malformed
   */
  _extractBucketAndPath(fileUrl) {
    const [, bucketAndPath] = fileUrl.split(SUPABASE_STORAGE_MARKER);
    if (!bucketAndPath) {
      throw new Error(`Malformed Supabase Storage URL — cannot extract bucket/path: ${fileUrl}`);
    }
    const slashIdx = bucketAndPath.indexOf("/");
    if (slashIdx === -1) {
      throw new Error(`Supabase Storage URL has no file path after the bucket name: ${fileUrl}`);
    }
    return {
      bucketName: bucketAndPath.substring(0, slashIdx),
      filePath: bucketAndPath.substring(slashIdx + 1),
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Downloads a file as a Node.js Buffer using the best available strategy:
   *   1. Supabase S3-compatible API  (when S3 credentials are configured)
   *   2. Supabase JS client download (when SUPABASE_ANON_KEY is set)
   *   3. Plain axios GET             (public URL / any other host)
   *
   * @param {string} fileUrl
   * @returns {Promise<Buffer>}
   */
  async getFileBuffer(fileUrl) {
    const isSupabase = this.isSupabaseStorageUrl(fileUrl);

    if (isSupabase && this.useS3) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const s3 = this.getS3Client();
      const res = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: filePath }));
      const byteArray = await res.Body.transformToByteArray();
      return Buffer.from(byteArray);
    }

    if (isSupabase && this.useSupabaseClient) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase.storage.from(bucketName).download(filePath);
      if (error) throw error;
      return Buffer.from(await data.arrayBuffer());
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
   *   2. Supabase signed URL + HTTP HEAD
   *   3. HTTP HEAD → byte-range GET fallback (for public URLs / CORS edge-cases)
   *
   * @param {string} fileUrl
   * @returns {Promise<true>}
   * @throws {Error}
   */
  async checkFileExists(fileUrl) {
    const isSupabase = this.isSupabaseStorageUrl(fileUrl);

    if (isSupabase && this.useS3) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const s3 = this.getS3Client();
      await s3.send(new HeadObjectCommand({ Bucket: bucketName, Key: filePath }));
      return true;
    }

    if (isSupabase && this.useSupabaseClient) {
      const { bucketName, filePath } = this._extractBucketAndPath(fileUrl);
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 60);
      if (error) throw error;
      const res = await axios.head(data.signedUrl, { timeout: 5000 });
      if (res.status >= 200 && res.status < 300) return true;
      throw new Error(`Supabase signed-URL HEAD returned HTTP ${res.status}`);
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
   * Uploads a file buffer and returns its public URL.
   *
   * @param {Buffer}  fileBuffer
   * @param {string}  mimetype   e.g. "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
   * @param {string}  filePath   Storage key / path within the bucket
   * @returns {Promise<string>}  Public URL of the uploaded file
   */
  async uploadFile(fileBuffer, mimetype, filePath, customBucket = null) {
    const bucketName = customBucket || (this.useS3
      ? (environmentVariables.SUPABASE_S3_BUCKET || "jet-admin-datasource-file-uploads")
      : "tenant-assets");

    if (this.useS3) {
      const s3 = this.getS3Client();
      await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: mimetype,
      }));

      const supabaseUrl = environmentVariables.SUPABASE_URL;
      if (!supabaseUrl) throw new Error("SUPABASE_URL is required to construct the public file URL after S3 upload.");
      return `${supabaseUrl}${SUPABASE_STORAGE_MARKER}${bucketName}/${filePath}`;
    }

    // Supabase JS client upload
    const supabase = await this.getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, { contentType: mimetype, upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return publicUrl;
  }
}

module.exports = new FileStorageUtil();