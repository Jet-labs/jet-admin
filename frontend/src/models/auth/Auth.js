export class Auth {
  /**
   *
   * @param {Boolean} isLoading
   * @param {object} pmUser
   * @param {Error} error
   */
  constructor({ isLoading, pmUser, error }) {
    /**
     * @type {Boolean}
     */
    this.isLoading = isLoading;
    /**
     * @type {object}
     */
    this.pmUser = pmUser;
    /**
     * @type {Error}
     */
    this.error = error;
  }
}
