var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  stringUtils: () => stringUtils
});
module.exports = __toCommonJS(index_exports);
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
//# sourceMappingURL=index.cjs.map
