import { Client } from "ssh2";
import crypto from "crypto";
import path from "path";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function normalizeRoot(root) {
  const raw = String(root || "").trim();
  if (!raw || raw === "." || raw === "./") return "";
  const normalized = path.posix.normalize(raw).replace(/\/+$/, "");
  return normalized === "/" ? "/" : normalized;
}

function buildClientConfig(options) {
  const config = {
    host: options.host,
    port: options.port || 22,
    username: options.username,
    readyTimeout: Math.max(1, Number(options.timeout) || 15) * 1000,
  };
  if (options.password) config.password = options.password;
  if (options.privateKey) config.privateKey = options.privateKey;
  if (options.passphrase) config.passphrase = options.passphrase;

  // Host-key verification: when a fingerprint is configured (SHA-256 base64
  // with or without the SHA256: prefix), require an exact match. Without it,
  // log a warning so the trust decision stays visible in operations logs.
  if (options.hostKeyFingerprint) {
    const expected = String(options.hostKeyFingerprint).trim().replace(/^SHA256:/i, "");
    config.hostVerifier = (hash, cb) => {
      try {
        const digest = crypto.createHash("sha256").update(hash).digest("base64");
        if (digest === expected) return cb(null, true);
        return cb(null, false);
      } catch (error) {
        return cb(error);
      }
    };
  } else {
    config.hostVerifier = (_hash, cb) => {
      Logger.log("warning", {
        message: "sftp:SFTPHandler:hostKeyNotVerified",
        params: { host: options.host, port: options.port },
      });
      cb(null, true);
    };
  }
  return config;
}

function resolveRemote(root, requested) {
  const normalizedRoot = normalizeRoot(root);
  const cleanPath = String(requested || ".");
  if (!normalizedRoot) {
    // No jail configured: absolute stays absolute, relative stays as-is
    // (SFTP resolves relative paths against the home directory).
    return cleanPath;
  }
  const joined = path.posix.normalize(path.posix.join(normalizedRoot, cleanPath));
  if (joined !== normalizedRoot && !joined.startsWith(`${normalizedRoot}/`)) {
    throw new Error(`Path ${requested} escapes the configured root.`);
  }
  return joined;
}

function realpath(server, remotePath) {
  return new Promise((resolve, reject) => {
    server.realpath(remotePath, (error, resolved) => (error ? reject(error) : resolve(resolved)));
  });
}

async function assertUnderRoot(server, root, requested) {
  const rootReal = await realpath(server, root);
  let targetReal;
  try {
    targetReal = await realpath(server, requested);
  } catch (error) {
    if (!error || !/No such file/.test(String(error.message || ""))) throw error;
    // Not-yet-created write target: canonicalize the parent instead.
    const parent = path.posix.dirname(requested);
    targetReal = path.posix.join(await realpath(server, parent), path.posix.basename(requested));
  }
  if (targetReal !== rootReal && !targetReal.startsWith(`${rootReal}/`)) {
    throw new Error(`Path ${requested} resolves outside the configured root.`);
  }
  return targetReal;
}

function connect(options) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    let settled = false;

    // Persistent lifecycle handler: post-connect errors must reject active
    // work rather than throw as uncaught EventEmitter errors.
    client.on("error", (error) => {
      Logger.log("warning", {
        message: "sftp:SFTPHandler:clientError",
        params: { error: error.message || String(error) },
      });
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    client.once("ready", () => {
      if (!settled) {
        settled = true;
        resolve(client);
      }
    });

    client.connect(buildClientConfig(options));
  });
}

function sftp(client) {
  return new Promise((resolve, reject) => {
    client.sftp((error, sftp) => (error ? reject(error) : resolve(sftp)));
  });
}

function readdir(server, remotePath) {
  return new Promise((resolve, reject) => {
    server.readdir(remotePath, (error, entries) => (error ? reject(error) : resolve(entries || [])));
  });
}

function stat(server, remotePath) {
  return new Promise((resolve, reject) => {
    server.stat(remotePath, (error, stats) => (error ? reject(error) : resolve(stats)));
  });
}

function boundedRead(server, remotePath, maxBytes) {
  return new Promise((resolve, reject) => {
    server.open(remotePath, "r", (error, handle) => {
      if (error) return reject(error);
      const chunks = [];
      let bytes = 0;
      const close = (fn) =>
        server.close(handle, (closeError) => (closeError ? reject(closeError) : fn()));
      const readChunk = () => {
        if (bytes >= maxBytes) return close(() => resolve(Buffer.concat(chunks)));
        const remaining = maxBytes - bytes;
        const buffer = Buffer.alloc(Math.min(65536, remaining));
        server.read(handle, buffer, 0, buffer.length, bytes, (readError, bytesRead, data) => {
          if (readError) return close(() => reject(readError));
          if (bytesRead === 0) return close(() => resolve(Buffer.concat(chunks)));
          chunks.push(data.subarray(0, bytesRead));
          bytes += bytesRead;
          return readChunk();
        });
      };
      readChunk();
    });
  });
}

function writeFile(server, remotePath, content) {
  return new Promise((resolve, reject) => {
    server.writeFile(remotePath, content, (error) =>
      error ? reject(error) : resolve({ success: true, path: remotePath })
    );
  });
}

async function withSftp(options, fn) {
  const client = await connect(options);
  try {
    const server = await sftp(client);
    if (options.rootPath) {
      await assertUnderRoot(server, options.rootPath, options.rootPath);
    }
    return await fn(server, options.rootPath);
  } finally {
    try {
      client.end();
    } catch {}
  }
}

export default class SFTPDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "list");
    const remotePath = resolveRemote(options.rootPath, dataQueryOptions?.path || ".");

    Logger.log("info", {
      message: "sftp:SFTPDataSource:execute:params",
      params: { operation, path: remotePath },
    });

    if (!options.host || !options.username) {
      throw new Error("SFTP host and username are required.");
    }
    if (!options.password && !options.privateKey) {
      throw new Error("SFTP password or privateKey is required.");
    }

    try {
      if (operation === "list") {
        const entries = await withSftp(options, async (server, root) => {
          if (root) await assertUnderRoot(server, root, remotePath);
          return readdir(server, remotePath);
        });
        return entries.map((entry) => ({
          name: entry.filename,
          path: entry.longname || entry.filename,
          type: entry.attrs?.isDirectory?.() ? "directory" : "file",
          size: entry.attrs?.size,
          modified: entry.attrs?.mtime ? new Date(entry.attrs.mtime * 1000).toISOString() : undefined,
        }));
      }

      if (operation === "stat") {
        const stats = await withSftp(options, async (server, root) => {
          if (root) await assertUnderRoot(server, root, remotePath);
          return stat(server, remotePath);
        });
        return {
          path: remotePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          mode: stats.mode,
          modified: stats.mtime ? new Date(stats.mtime * 1000).toISOString() : undefined,
        };
      }

      if (operation === "read") {
        const cap = Number(dataQueryOptions.maxBytes) > 0 ? Number(dataQueryOptions.maxBytes) : 1048576;
        const { stats, buffer } = await withSftp(options, async (server, root) => {
          if (root) await assertUnderRoot(server, root, remotePath);
          const info = await stat(server, remotePath);
          const data = await boundedRead(server, remotePath, cap);
          return { stats: info, buffer: data };
        });
        return {
          path: remotePath,
          bytesRead: buffer.length,
          truncated: stats.size > buffer.length,
          content:
            (dataQueryOptions.encoding || "utf8") === "base64"
              ? buffer.toString("base64")
              : buffer.toString("utf8"),
        };
      }

      if (operation === "write") {
        if (dataQueryOptions.content === undefined || dataQueryOptions.content === null) {
          throw new Error("content is required for an SFTP write.");
        }
        return await withSftp(options, async (server, root) => {
          if (root) await assertUnderRoot(server, root, remotePath);
          return writeFile(server, remotePath, String(dataQueryOptions.content));
        });
      }

      throw new Error(`Unsupported SFTP operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "sftp:SFTPDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`SFTP query failed: ${error.message || String(error)}`);
    }
  }
}

export { connect, sftp, normalizeRoot, resolveRemote, realpath, assertUnderRoot, boundedRead, withSftp, buildClientConfig };
