/**
 * storage-init.js
 *
 * One-shot bucket bootstrap for S3-compatible object storage
 * (bundled RustFS, MinIO, or anything S3-compatible).
 *
 * For each upload bucket it:
 *   1. Creates the bucket when missing (HeadBucket → CreateBucket).
 *   2. Attaches a public-read policy so S3_PUBLIC_BASE_URL links
 *      render directly in browsers.
 *
 * Used by the `storage-init` compose service (`--profile storage`).
 * Exits 0 on success (or when everything already exists), non-zero
 * with the error message otherwise.
 *
 * Required env: S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * Optional env: S3_REGION (default us-east-1),
 *               S3_BUCKET (default constants.STORAGE value),
 *               S3_FORCE_PATH_STYLE (default "true"),
 *               STORAGE_INIT_MAX_ATTEMPTS (default 30, 2s apart).
 */

const {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} = require("@aws-sdk/client-s3");
const constants = require("../constants");

const ENDPOINT = process.env.S3_ENDPOINT;
const REGION = process.env.S3_REGION || "us-east-1";
const ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE || "true") !== "false";
const MAX_ATTEMPTS = parseInt(process.env.STORAGE_INIT_MAX_ATTEMPTS || "30", 10);

const BUCKETS = [
  process.env.S3_BUCKET || constants.STORAGE.BUCKETS.DATASOURCE_FILE_UPLOADS,
  constants.STORAGE.BUCKETS.TENANT_ASSETS,
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function publicReadPolicy(bucket) {
  return JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: { AWS: "*" },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });
}

async function ensureBucket(s3, bucket) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`storage-init: bucket "${bucket}" already exists`);
  } catch (err) {
    const status = err.$metadata && err.$metadata.httpStatusCode;
    if (status !== 404 && err.name !== "NotFound" && err.name !== "NoSuchBucket") throw err;
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`storage-init: bucket "${bucket}" created`);
  }

  try {
    await s3.send(
      new PutBucketPolicyCommand({ Bucket: bucket, Policy: publicReadPolicy(bucket) })
    );
    console.log(`storage-init: bucket "${bucket}" is publicly readable`);
  } catch (err) {
    // Non-fatal: server-side uploads/downloads keep working; only direct
    // browser links need the policy (can also be set in the storage console).
    console.warn(
      `storage-init: WARNING — could not set public-read policy on "${bucket}": ${err.message}`
    );
  }
}

async function main() {
  if (!ENDPOINT || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must all be set."
    );
  }

  const s3 = new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    forcePathStyle: FORCE_PATH_STYLE,
  });

  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      for (const bucket of BUCKETS) {
        await ensureBucket(s3, bucket);
      }
      console.log("storage-init: buckets ready");
      return;
    } catch (err) {
      lastErr = err;
      console.log(
        `storage-init: attempt ${attempt}/${MAX_ATTEMPTS} failed (${err.message}) — retrying in 2s…`
      );
      await sleep(2000);
    }
  }
  throw lastErr;
}

main().catch((err) => {
  console.error(`storage-init: FAILED — ${err && err.message ? err.message : err}`);
  process.exit(1);
});
