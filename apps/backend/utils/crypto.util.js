const crypto = require("crypto");

/**
 * Generates a cryptographically secure random string of specified length.
 * @param {Number} length
 * @returns {String}
 */
const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
};

/**
 * Compares a plain text password with a hashed password using timing-safe equality check.
 * Supports a fallback check for legacy 1000 iteration hashes.
 *
 * @param {object} param0
 * @param {String} param0.password
 * @param {String} param0.salt
 * @param {String} param0.passwordHash
 * @returns {Boolean}
 */
const comparePasswordWithHash = ({ password, salt, passwordHash }) => {
  // 1. Try standard 600,000 iterations
  const providedHash600k = crypto
    .pbkdf2Sync(password, salt, 600000, 64, "sha512")
    .toString("hex");

  const bufferA = Buffer.from(passwordHash, "hex");
  let bufferB = Buffer.from(providedHash600k, "hex");

  if (bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB)) {
    return true;
  }

  // 2. Legacy fallback to 1,000 iterations
  const providedHash1k = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  bufferB = Buffer.from(providedHash1k, "hex");
  if (bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB)) {
    return true;
  }

  return false;
};

/**
 * Generates a salt and password hash using 600,000 PBKDF2 iterations.
 *
 * @param {object} param0
 * @param {String} param0.password
 * @returns {object} { salt, passwordHash }
 */
const generateSaltAndPasswordHash = ({ password }) => {
  const salt = generateRandomString(32);
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 600000, 64, "sha512")
    .toString("hex");
  return { salt, passwordHash };
};

const generateAPIKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashAPIKey = (apiKey) => {
  const hash = crypto.createHash("sha256").update(apiKey).digest("hex");
  return { prefix: apiKey.substring(0, 8), hash };
};

const verifyAPIKeyHash = (apiKey, hash) => {
  const providedHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const bufferA = Buffer.from(hash, "hex");
  const bufferB = Buffer.from(providedHash, "hex");
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
};

module.exports = {
  generateRandomString,
  comparePasswordWithHash,
  generateSaltAndPasswordHash,
  generateAPIKey,
  hashAPIKey,
  verifyAPIKeyHash,
};
