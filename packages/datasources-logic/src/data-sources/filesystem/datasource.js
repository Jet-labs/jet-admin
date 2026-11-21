import fs from "fs/promises";
import path from "path";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

// Filesystem datasource: local reads jailed under a configured root.
// `resolveInRoot` rejects absolute escapes and `..` traversal outside root.
function normalizeRoot(root) {
  const raw = String(root || "");
  if (!raw || raw === "." || raw === "./") return "";
  const resolved = path.resolve(raw);
  // Preserve a filesystem root without creating a `//` containment prefix.
  return resolved === path.parse(resolved).root
    ? resolved
    : resolved.replace(/[/\\]+$/, "");
}

function resolveInRoot(root, requested) {
  const normalizedRoot = normalizeRoot(root);
  if (!normalizedRoot) {
    throw new Error("rootPath is required for the filesystem datasource.");
  }
  const candidate = path.resolve(normalizedRoot, String(requested || "."));
  const rootWithSep = normalizedRoot.endsWith(path.sep) ? normalizedRoot : `${normalizedRoot}${path.sep}`;
  if (candidate !== normalizedRoot && !candidate.startsWith(rootWithSep)) {
    throw new Error(`Path ${requested} escapes the configured root.`);
  }
  return candidate;
}

function relativeToRoot(root, absolute) {
  const normalizedRoot = normalizeRoot(root) || path.resolve(String(root || ""));
  const rel = path.relative(normalizedRoot, absolute);
  return rel === "" ? "." : rel.split(path.sep).join("/");
}

// Canonicalize a target through realpath() so symlink/… escapes are caught.
// Non-existent suffixes are resolved by walking to the nearest existing
// ancestor, canonicalizing it, then re-appending the remainder.
async function canonicalizeInRoot(root, requested) {
  const normalizedRoot = normalizeRoot(root);
  if (!normalizedRoot) throw new Error("rootPath is required for the filesystem datasource.");

  const lexical = resolveInRoot(normalizedRoot, requested);
  const realRoot = await fs.realpath(normalizedRoot);

  let current = lexical;
  const remainder = [];
  while (true) {
    try {
      const real = await fs.realpath(current);
      const candidate = remainder.length > 0 ? path.join(real, ...remainder) : real;
      if (candidate !== realRoot && !candidate.startsWith(`${realRoot}${path.sep}`)) {
        throw new Error(`Path ${requested} resolves outside the configured root.`);
      }
      return candidate;
    } catch (error) {
      if (error && error.code !== "ENOENT") throw error;
      const parent = path.dirname(current);
      if (parent === current) {
        throw new Error(`Path ${requested} resolves outside the configured root.`);
      }
      remainder.unshift(path.basename(current));
      current = parent;
    }
  }
}

export default class FileSystemDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "list");
    const root = String(options.rootPath || "").trim();
    const maxFileSize = Number(options.maxFileSize) || 1048576;
    const maxEntries = Number(options.maxEntries) || 200;

    Logger.log("info", {
      message: "filesystem:FileSystemDataSource:execute:params",
      params: { operation, path: dataQueryOptions?.path },
    });

    if (!root) {
      throw new Error("rootPath is required for the filesystem datasource.");
    }

    const target = await canonicalizeInRoot(root, dataQueryOptions?.path || ".");

    try {
      if (operation === "list") {
        const entries = await fs.readdir(target, { withFileTypes: true });
        const visible = entries.filter(
          (entry) => options.showHidden || !entry.name.startsWith(".")
        );
        return visible.slice(0, maxEntries).map((entry) => ({
          name: entry.name,
          path: relativeToRoot(root, path.join(target, entry.name)),
          type: entry.isDirectory() ? "directory" : entry.isSymbolicLink() ? "symlink" : "file",
          isDirectory: entry.isDirectory(),
        }));
      }

      if (operation === "read") {
        const stat = await fs.stat(target);
        if (!stat.isFile()) throw new Error(`Path ${dataQueryOptions?.path} is not a file.`);
        const cap = Math.min(
          maxFileSize,
          Number(dataQueryOptions.maxBytes) > 0 ? Number(dataQueryOptions.maxBytes) : maxFileSize
        );
        const handle = await fs.open(target, "r");
        try {
          const buffer = Buffer.alloc(cap);
          const { bytesRead } = await handle.read(buffer, 0, cap, 0);
          const slice = buffer.subarray(0, bytesRead);
          return {
            path: relativeToRoot(root, target),
            size: stat.size,
            bytesRead,
            truncated: stat.size > bytesRead,
            content:
              (dataQueryOptions.encoding || "utf8") === "base64"
                ? slice.toString("base64")
                : slice.toString("utf8"),
          };
        } finally {
          await handle.close();
        }
      }

      if (operation === "stat") {
        const stat = await fs.stat(target);
        return {
          path: relativeToRoot(root, target),
          size: stat.size,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
          mtime: stat.mtime.toISOString(),
          birthtime: stat.birthtime.toISOString(),
        };
      }

      throw new Error(`Unsupported filesystem operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "filesystem:FileSystemDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`Filesystem query failed: ${error.message || String(error)}`);
    }
  }
}

export { resolveInRoot, canonicalizeInRoot, normalizeRoot };
