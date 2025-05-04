/**
 * This file is the entry point for the ui-components package.
 * It exports all the components and utils from the package.
 */
export const stringUtils = {
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
  containsWhitespace: (str) => /\s/.test(str),
};

