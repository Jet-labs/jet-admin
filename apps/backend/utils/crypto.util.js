const crypto = require("crypto");

/**
 *
 * @param {Number} length
 * @returns {String}
 */
const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 *
 * @param {object} param0
 * @param {String} param0.password
 * @param {String} param0.passwordHash
 * @returns {String}
 */
const comparePasswordWithHash = ({ password, salt, passwordHash }) => {
  const providedPasswordHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return String(passwordHash) === String(providedPasswordHash);
};

/**
 *
 * @param {object} param0
 * @param {String} param0.password
 * @returns {object}
 */
const generateSaltAndPasswordHash = ({ password }) => {
  const salt = generateRandomString(32);
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return { salt, passwordHash };
};

module.exports = {
  generateRandomString,
  comparePasswordWithHash,
  generateSaltAndPasswordHash,
};
