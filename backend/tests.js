const crypto = require("crypto");
// const salt = crypto.randomBytes(16).toString("hex");


const salt = "ed2b6072e463cbe7e5387de6bae69d55";
const providedPasswordHash = crypto
  .pbkdf2Sync('password', salt, 1000, 64, `sha512`)
  .toString(`hex`);

  console.log(providedPasswordHash)