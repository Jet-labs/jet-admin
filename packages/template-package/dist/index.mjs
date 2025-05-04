// src/index.js
var stringUtils = {
  /**
   * 
   * @param {string} str 
   * @param {number} length 
   * @returns 
   */
  truncateName: (str, length) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  },
  /**
   * 
   * @param {string} str 
   * @returns 
   */
  containsWhitespace: (str) => /\s/.test(str)
};
export {
  stringUtils
};
//# sourceMappingURL=index.mjs.map
